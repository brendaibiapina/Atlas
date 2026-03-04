#!/usr/bin/env python3
"""
orchestrator.py — Agente Orquestrador do ATLAS

CLI interativo para:
  - Gerenciar sub-agentes de coleta
  - Conversar sobre novas tarefas de automação  
  - Executar coletas sob demanda
  - Ver status e relatórios
"""

import json
import importlib
import os
import sys
from datetime import datetime
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt
from rich.text import Text
from loguru import logger

from config import get_supabase

console = Console()

# ── Registry ─────────────────────────────────────────────

REGISTRY_PATH = Path(__file__).parent / "registry.json"


def load_registry() -> dict:
    """Carrega o registro de agentes."""
    if REGISTRY_PATH.exists():
        with open(REGISTRY_PATH) as f:
            return json.load(f)
    return {"agents": [], "last_global_run": None}


def save_registry(registry: dict):
    """Salva o registro de agentes."""
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=4, ensure_ascii=False)


def get_agent_instance(agent_config: dict):
    """Instancia um sub-agente a partir da configuração do registro."""
    module = importlib.import_module(agent_config["module"])
    cls = getattr(module, agent_config["class"])
    return cls()


# ── Comandos ─────────────────────────────────────────────

def cmd_listar():
    """Lista todos os sub-agentes registrados."""
    registry = load_registry()
    
    table = Table(title="🤖 Sub-agentes Registrados", show_lines=True)
    table.add_column("Nome", style="cyan bold")
    table.add_column("Descrição", style="white")
    table.add_column("Frequência", style="yellow")
    table.add_column("Ativo", style="green")
    
    for agent in registry["agents"]:
        status = "✅" if agent.get("enabled", True) else "❌"
        table.add_row(
            agent["name"],
            agent["description"],
            agent["schedule"],
            status
        )
    
    console.print(table)
    
    if registry.get("last_global_run"):
        console.print(f"\n⏱️  Última execução global: {registry['last_global_run']}", style="dim")


def cmd_rodar(agent_name: str):
    """Executa um sub-agente específico."""
    registry = load_registry()
    
    agent_config = None
    for a in registry["agents"]:
        if a["name"] == agent_name:
            agent_config = a
            break
    
    if not agent_config:
        console.print(f"❌ Agente '{agent_name}' não encontrado.", style="red")
        console.print("Use 'listar' para ver os agentes disponíveis.")
        return
    
    console.print(f"\n🚀 Executando: [cyan bold]{agent_name}[/]")
    console.print(f"   {agent_config['description']}\n")
    
    try:
        agent = get_agent_instance(agent_config)
        supabase = get_supabase()
        
        if not supabase:
            console.print("⚠️  Supabase não configurado. Executando em modo [yellow]DRY-RUN[/].\n")
        
        results = agent.run(supabase)
        
        # Mostra relatório
        console.print(Panel(
            agent.report(),
            title=f"📊 Relatório — {agent_name}",
            border_style="green" if not results["errors"] else "red"
        ))
        
        # Atualiza last_run no registry
        agent_config["last_run"] = datetime.now().isoformat()
        save_registry(registry)
        
    except Exception as e:
        console.print(f"💥 Erro ao executar {agent_name}: {e}", style="red")
        logger.error(f"Erro no agente {agent_name}: {e}")


def cmd_rodar_todos():
    """Executa todos os sub-agentes ativos."""
    registry = load_registry()
    
    active_agents = [a for a in registry["agents"] if a.get("enabled", True)]
    
    if not active_agents:
        console.print("⚠️  Nenhum agente ativo encontrado.", style="yellow")
        return
    
    console.print(f"\n🚀 Executando [cyan bold]{len(active_agents)}[/] agentes...\n")
    
    for agent_config in active_agents:
        cmd_rodar(agent_config["name"])
        console.print("")
    
    registry["last_global_run"] = datetime.now().isoformat()
    save_registry(registry)
    
    console.print("✅ Execução global concluída!", style="green bold")


def cmd_status():
    """Mostra o status de todos os agentes."""
    registry = load_registry()
    
    table = Table(title="📊 Status dos Agentes", show_lines=True)
    table.add_column("Agente", style="cyan bold")
    table.add_column("Última Execução", style="white")
    table.add_column("Frequência", style="yellow")
    table.add_column("Status", style="green")
    
    for agent in registry["agents"]:
        last_run = agent.get("last_run", "Nunca")
        if last_run != "Nunca":
            try:
                dt = datetime.fromisoformat(last_run)
                last_run = dt.strftime("%d/%m/%Y %H:%M")
            except:
                pass
        
        status = "✅ Ativo" if agent.get("enabled", True) else "❌ Desativado"
        
        table.add_row(
            agent["name"],
            last_run,
            agent["schedule"],
            status
        )
    
    console.print(table)


def cmd_nova_tarefa():
    """
    Fluxo interativo para criar um novo sub-agente.
    Conversa com o usuário para entender a tarefa manual.
    """
    console.print(Panel(
        "[bold]📝 Vamos criar um novo sub-agente![/]\n\n"
        "Descreva a tarefa que você faz manualmente e eu vou\n"
        "planejar uma automação para ela.",
        title="Nova Tarefa",
        border_style="cyan"
    ))
    
    # 1. Descrição da tarefa
    descricao = Prompt.ask("\n🔍 Descreva a tarefa manual")
    
    # 2. URL
    url = Prompt.ask("🌐 Qual a URL da fonte de dados", default="")
    
    # 3. Frequência
    frequencia = Prompt.ask(
        "⏰ Com que frequência rodar",
        choices=["daily", "weekly", "manual"],
        default="weekly"
    )
    
    # 4. Tabela destino
    tabela = Prompt.ask(
        "🗃️  Qual tabela de destino",
        choices=["legal_references", "obligations"],
        default="legal_references"
    )
    
    # 5. Nome do agente
    nome_sugerido = descricao.lower().replace(" ", "_")[:20]
    nome = Prompt.ask("🏷️  Nome do agente", default=f"custom_{nome_sugerido}")
    
    # Registra no registry
    registry = load_registry()
    
    new_agent = {
        "name": nome,
        "module": f"agents.{nome}",
        "class": f"{nome.title().replace('_', '')}Agent",
        "schedule": frequencia,
        "enabled": True,
        "description": descricao,
        "source_url": url,
        "target_table": tabela,
        "created_at": datetime.now().isoformat()
    }
    
    registry["agents"].append(new_agent)
    save_registry(registry)
    
    # Gera o arquivo do agente
    agent_code = _generate_agent_code(new_agent)
    agent_path = Path(__file__).parent / "agents" / f"{nome}.py"
    
    with open(agent_path, "w") as f:
        f.write(agent_code)
    
    console.print(Panel(
        f"✅ [green bold]Agente criado com sucesso![/]\n\n"
        f"  Nome: [cyan]{nome}[/]\n"
        f"  Arquivo: agents/{nome}.py\n"
        f"  Frequência: {frequencia}\n"
        f"  Tabela: {tabela}\n\n"
        f"  Execute: [yellow]rodar {nome}[/]",
        title="Agente Registrado",
        border_style="green"
    ))
    
    console.print("\n⚠️  [yellow]O agente foi gerado com uma estrutura básica.[/]")
    console.print("    Pode ser necessário ajustar o parse() para o HTML específico da fonte.\n")


def _generate_agent_code(config: dict) -> str:
    """Gera o código Python de um novo sub-agente."""
    class_name = config["class"]
    return f'''"""
{config["name"]}.py — Sub-agente customizado

Descrição: {config["description"]}
Fonte: {config.get("source_url", "N/A")}
Tabela alvo: {config["target_table"]}
"""

from agents.base_agent import BaseAgent
from utils.scraper import fetch_page
from utils.parser import soupify, clean_text, generate_tags
from loguru import logger


class {class_name}(BaseAgent):
    name = "{config["name"]}"
    description = "{config["description"]}"
    source_url = "{config.get("source_url", "")}"
    target_table = "{config["target_table"]}"
    schedule = "{config["schedule"]}"

    def fetch(self) -> str:
        return fetch_page(self.source_url)

    def parse(self, raw_html: str) -> list[dict]:
        """
        TODO: Implementar o parse específico para esta fonte.
        Ajuste a lógica abaixo conforme a estrutura HTML da página.
        """
        soup = soupify(raw_html)
        items = []
        
        # Exemplo: busca todos os links que parecem relevantes
        content = soup.find("div", {{"id": "content-core"}}) or soup.find("article") or soup
        
        for heading in content.find_all(["h2", "h3"]):
            link = heading.find("a")
            if link and link.get("href"):
                title = clean_text(link.get_text())
                if title and len(title) > 10:
                    items.append({{
                        "title": title[:200],
                        "source_type": "RFB",
                        "publication_date": None,
                        "summary": title,
                        "status": "VIGENTE",
                        "tags": generate_tags(title),
                        "full_text_url": link["href"]
                    }})
        
        logger.info(f"📦 {{len(items)}} itens extraídos")
        return items
'''


# ── Loop Principal ───────────────────────────────────────

def show_banner():
    """Mostra o banner do orquestrador."""
    banner = Text()
    banner.append("🎯 ATLAS ", style="bold cyan")
    banner.append("Orquestrador de Automações\n", style="bold white")
    banner.append("━" * 40 + "\n", style="dim")
    banner.append("Sistema de coleta automática de dados\n", style="dim")
    banner.append("da Reforma Tributária do Consumo", style="dim")
    
    console.print(Panel(banner, border_style="cyan"))
    
    console.print("Comandos disponíveis:", style="bold")
    console.print("  [cyan]listar[/]         → Ver sub-agentes registrados")
    console.print("  [cyan]rodar[/] <nome>   → Executar um sub-agente")
    console.print("  [cyan]rodar-todos[/]    → Executar todos os ativos")
    console.print("  [cyan]status[/]         → Status de todos os agentes")
    console.print("  [cyan]nova-tarefa[/]    → Criar novo sub-agente")
    console.print("  [cyan]sair[/]           → Encerrar\n")


def main():
    """Loop principal do orquestrador."""
    show_banner()
    
    # Suporte a execução via argumentos
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "listar":
            cmd_listar()
        elif command == "rodar" and len(sys.argv) > 2:
            cmd_rodar(sys.argv[2])
        elif command == "rodar-todos":
            cmd_rodar_todos()
        elif command == "status":
            cmd_status()
        elif command == "nova-tarefa":
            cmd_nova_tarefa()
        else:
            console.print(f"❌ Comando desconhecido: {command}", style="red")
        return
    
    # Modo interativo
    while True:
        try:
            cmd = Prompt.ask("\n[cyan bold]>[/]").strip().lower()
            
            if cmd == "sair" or cmd == "exit" or cmd == "q":
                console.print("👋 Até logo!", style="cyan")
                break
            elif cmd == "listar":
                cmd_listar()
            elif cmd.startswith("rodar-todos"):
                cmd_rodar_todos()
            elif cmd.startswith("rodar "):
                agent_name = cmd.split(" ", 1)[1].strip()
                cmd_rodar(agent_name)
            elif cmd == "status":
                cmd_status()
            elif cmd == "nova-tarefa":
                cmd_nova_tarefa()
            elif cmd == "help" or cmd == "ajuda":
                show_banner()
            else:
                console.print(f"❓ Comando desconhecido: '{cmd}'. Digite 'ajuda' para ver os comandos.", style="yellow")
                
        except KeyboardInterrupt:
            console.print("\n👋 Até logo!", style="cyan")
            break
        except Exception as e:
            console.print(f"💥 Erro: {e}", style="red")
            logger.error(f"Erro no orquestrador: {e}")


if __name__ == "__main__":
    main()
