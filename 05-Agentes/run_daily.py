#!/usr/bin/env python3
"""
run_daily.py — Execução diária automatizada dos agentes ATLAS

Executa todos os agentes marcados como 'daily' no registry.json,
gera relatório e salva log. Pode ser acionado via:
  - macOS launchd (com.atlas.daily-monitor.plist)
  - cron (crontab -e → "0 7 * * * /path/to/run_daily.py")
  - manualmente: python run_daily.py
"""

import json
import importlib
import sys
import os
from datetime import datetime
from pathlib import Path

# Garante que o diretório correto é usado
SCRIPT_DIR = Path(__file__).parent.resolve()
os.chdir(SCRIPT_DIR)
sys.path.insert(0, str(SCRIPT_DIR))

from config import get_supabase
from loguru import logger

REGISTRY_PATH = SCRIPT_DIR / "registry.json"
REPORTS_DIR = SCRIPT_DIR / "logs" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def load_registry() -> dict:
    with open(REGISTRY_PATH) as f:
        return json.load(f)


def save_registry(registry: dict):
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=4, ensure_ascii=False)


def get_agent_instance(agent_config: dict):
    module = importlib.import_module(agent_config["module"])
    cls = getattr(module, agent_config["class"])
    return cls()


def run_daily():
    """Executa todos os agentes com schedule='daily'."""
    started = datetime.now()
    logger.info("=" * 60)
    logger.info(f"🚀 ATLAS Daily Monitor — {started.strftime('%d/%m/%Y %H:%M')}")
    logger.info("=" * 60)

    registry = load_registry()
    supabase = get_supabase()
    execution_mode = "PERSISTENCIA" if supabase else "DRY-RUN"

    if not supabase:
        logger.warning("⚠️  Supabase não configurado. Executando em DRY-RUN.")

    daily_agents = [
        a for a in registry["agents"]
        if a.get("enabled", True) and a.get("schedule") == "daily"
    ]

    if not daily_agents:
        logger.info("📭 Nenhum agente diário ativo.")
        return

    logger.info(f"📋 {len(daily_agents)} agentes diários para executar:\n")
    for a in daily_agents:
        logger.info(f"   • {a['name']} — {a['description']}")

    results = []
    for agent_config in daily_agents:
        logger.info(f"\n{'─' * 40}")
        logger.info(f"▶ Executando: {agent_config['name']}")
        try:
            agent = get_agent_instance(agent_config)
            result = agent.run(supabase)
            report = agent.report()
            results.append({
                "name": agent_config["name"],
                "result": result,
                "report": report,
                "success": True
            })
            logger.info(report)

            # Atualiza last_run
            agent_config["last_run"] = datetime.now().isoformat()

        except Exception as e:
            logger.error(f"💥 Falha no agente {agent_config['name']}: {e}")
            results.append({
                "name": agent_config["name"],
                "result": {"errors": [str(e)]},
                "report": f"ERRO: {e}",
                "success": False
            })

    # Salva registry atualizado
    registry["last_global_run"] = datetime.now().isoformat()
    save_registry(registry)

    # Gera relatório consolidado
    finished = datetime.now()
    duration = (finished - started).total_seconds()

    total_fetched = sum(r["result"].get("fetched", 0) for r in results)
    total_new = sum(r["result"].get("new", 0) for r in results)
    total_would_insert = sum(r["result"].get("would_insert", 0) for r in results)
    total_errors = sum(len(r["result"].get("errors", [])) for r in results)

    summary = [
        "",
        "=" * 60,
        f"📊 RELATÓRIO DIÁRIO — {finished.strftime('%d/%m/%Y %H:%M')}",
        "=" * 60,
        f"  Modo de execucao:    {execution_mode}",
        f"  Agentes executados: {len(results)}",
        f"  Itens extraídos:    {total_fetched}",
        f"  Novos inseridos:    {total_new}",
        f"  Potenciais (dry-run): {total_would_insert}",
        f"  Erros:              {total_errors}",
        f"  Duração:            {duration:.1f}s",
        "─" * 60,
    ]
    for r in results:
        status = "✅" if r["success"] else "❌"
        fetched = r["result"].get("fetched", 0)
        new = r["result"].get("new", 0)
        would_insert = r["result"].get("would_insert", new)
        summary.append(f"  {status} {r['name']}: {fetched} extraídos, {new} inseridos, {would_insert} potenciais")
    summary.append("=" * 60)

    summary_text = "\n".join(summary)
    logger.info(summary_text)

    # Salva relatório em arquivo
    report_file = REPORTS_DIR / f"daily_{finished.strftime('%Y-%m-%d_%H%M')}.txt"
    with open(report_file, "w") as f:
        f.write(summary_text)
        f.write("\n\n--- DETALHES ---\n\n")
        for r in results:
            f.write(f"\n{'─' * 40}\n{r['name']}:\n{r['report']}\n")

    logger.info(f"\n📄 Relatório salvo em: {report_file}")
    return results


if __name__ == "__main__":
    run_daily()
