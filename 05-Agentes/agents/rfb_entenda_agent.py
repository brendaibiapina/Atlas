"""
rfb_entenda_agent.py — Sub-agente que monitora a página "Entenda a Reforma"

Verifica se houve alterações na página oficial de explicação da reforma,
detectando novas seções, mudanças na cronologia, ou atualizações.

Fonte: https://www.gov.br/receitafederal/.../reforma-consumo/entenda
Tabela alvo: legal_references (registra como atualização RFB)
"""

import hashlib
import json
import os
from pathlib import Path
from agents.base_agent import BaseAgent
from utils.scraper import fetch_page
from utils.parser import soupify, clean_text
from config import RFB_REFORMA_URL
from loguru import logger
from datetime import datetime

ENTENDA_URL = f"{RFB_REFORMA_URL}/entenda"
STATE_FILE = Path(__file__).parent.parent / "logs" / "entenda_state.json"


class RFBEntendaAgent(BaseAgent):
    name = "rfb_entenda"
    description = "Monitora mudanças na página 'Entenda a Reforma' da RFB (cronologia, regras, alíquotas)"
    source_url = ENTENDA_URL
    target_table = "legal_references"
    schedule = "weekly"

    def fetch(self) -> str:
        return fetch_page(self.source_url)

    def parse(self, raw_html: str) -> list[dict]:
        """
        Compara o conteúdo atual com o estado salvo.
        Se detectar mudanças, gera um registro de atualização.
        """
        soup = soupify(raw_html)
        items = []

        # Extrai o conteúdo principal
        content = soup.find("div", {"id": "content-core"}) or soup.find("article") or soup
        
        # Extrai todas as seções com seus textos
        sections = {}
        current_section = "Introdução"
        
        for elem in content.find_all(["h2", "h3", "p", "li", "ul"]):
            if elem.name in ["h2", "h3"]:
                current_section = clean_text(elem.get_text())
                if current_section not in sections:
                    sections[current_section] = []
            elif elem.name in ["p", "li"]:
                text = clean_text(elem.get_text())
                if text and len(text) > 10:
                    if current_section not in sections:
                        sections[current_section] = []
                    sections[current_section].append(text)

        # Calcula hash do conteúdo atual
        content_text = json.dumps(sections, ensure_ascii=False, sort_keys=True)
        current_hash = hashlib.md5(content_text.encode()).hexdigest()

        # Carrega o estado anterior
        previous_state = self._load_state()
        previous_hash = previous_state.get("hash", "")
        previous_sections = previous_state.get("sections", {})

        # Sempre registra as seções do cronograma como informação
        cronograma_sections = ["2026", "2027 e 2028", "2029 a 2032", "2033"]
        
        if current_hash != previous_hash:
            # Detectou mudança!
            logger.info("🔔 Mudança detectada na página 'Entenda a Reforma'!")
            
            # Identifica quais seções mudaram
            new_sections = set(sections.keys()) - set(previous_sections.keys())
            removed_sections = set(previous_sections.keys()) - set(sections.keys())
            changed_sections = []
            
            for section_name in sections:
                if section_name in previous_sections:
                    old_text = " ".join(previous_sections[section_name])
                    new_text = " ".join(sections[section_name])
                    if old_text != new_text:
                        changed_sections.append(section_name)
            
            # Cria registro de atualização
            change_summary_parts = []
            if new_sections:
                change_summary_parts.append(f"Novas seções: {', '.join(new_sections)}")
            if removed_sections:
                change_summary_parts.append(f"Seções removidas: {', '.join(removed_sections)}")
            if changed_sections:
                change_summary_parts.append(f"Seções alteradas: {', '.join(changed_sections)}")
            
            change_summary = "; ".join(change_summary_parts) if change_summary_parts else "Conteúdo da página atualizado"
            
            items.append({
                "title": f"Atualização: Página 'Entenda a Reforma' — {datetime.now().strftime('%d/%m/%Y')}",
                "source_type": "RFB",
                "publication_date": datetime.now().strftime("%Y-%m-%d"),
                "summary": f"A RFB atualizou a página 'Entenda a Reforma Tributária do Consumo'. {change_summary}",
                "status": "VIGENTE",
                "tags": ["GERAL", "TRANSICAO"],
                "full_text_url": self.source_url
            })
            
            # Detalha mudanças por seção do cronograma
            for section_name in cronograma_sections:
                if section_name in new_sections or section_name in changed_sections:
                    section_text = " | ".join(sections.get(section_name, []))
                    items.append({
                        "title": f"Cronograma Reforma — {section_name} (atualizado)",
                        "source_type": "RFB",
                        "publication_date": datetime.now().strftime("%Y-%m-%d"),
                        "summary": section_text[:500],
                        "status": "VIGENTE",
                        "tags": ["TRANSICAO", "GERAL"],
                        "full_text_url": self.source_url
                    })
        else:
            logger.info("✅ Nenhuma mudança detectada na página 'Entenda a Reforma'")

        # Salva o estado atual
        self._save_state({
            "hash": current_hash,
            "sections": sections,
            "last_check": datetime.now().isoformat()
        })

        return items

    def _load_state(self) -> dict:
        """Carrega o estado anterior."""
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE) as f:
                    return json.load(f)
            except:
                pass
        return {}

    def _save_state(self, state: dict):
        """Salva o estado atual usando escrita atômica."""
        temp_file = STATE_FILE.with_suffix('.tmp')
        try:
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
                f.flush()
                os.fsync(f.fileno())
            os.replace(temp_file, STATE_FILE)
            logger.debug(f"💾 Estado salvo atomicamente em {STATE_FILE}")
        except Exception as e:
            logger.error(f"Erro ao salvar estado: {e}")
            if temp_file.exists():
                try:
                    temp_file.unlink()
                except:
                    pass
