"""
rfb_orientacoes_agent.py — Sub-agente que coleta obrigações das Orientações 2026

Fonte: https://www.gov.br/receitafederal/.../reforma-consumo/orientacoes-2026
Tabela alvo: obligations
"""

import re
from agents.base_agent import BaseAgent
from utils.scraper import fetch_page
from utils.parser import soupify, clean_text
from config import RFB_ORIENTACOES_URL
from loguru import logger


class RFBOrientacoesAgent(BaseAgent):
    name = "rfb_orientacoes"
    description = "Coleta atualizações nas orientações de obrigações para 2026"
    source_url = RFB_ORIENTACOES_URL
    target_table = "obligations"
    schedule = "weekly"

    def fetch(self) -> str:
        return fetch_page(self.source_url)

    def parse(self, raw_html: str) -> list[dict]:
        """
        Extrai obrigações da página de orientações 2026.
        A página lista documentos fiscais obrigatórios (NF-e, NFS-e, etc.)
        e outras obrigações por seção.
        """
        soup = soupify(raw_html)
        items = []
        
        content = soup.find("div", {"id": "content-core"}) or soup.find("article") or soup

        # Mapeamento de público-alvo por palavras-chave
        audience_map = {
            'NF-e': ['CONTADOR'],
            'NFC-e': ['CONTADOR'],
            'CT-e': ['CONTADOR'],
            'NFS-e': ['CONTADOR', 'ADVOGADO'],
            'NFCom': ['CONTADOR'],
            'NF3e': ['CONTADOR'],
            'BP-e': ['CONTADOR'],
            'DeRE': ['CONTADOR', 'ADVOGADO'],
            'CNPJ': ['CONTADOR', 'ADVOGADO'],
            'NF-ABI': ['IMOBILIARIO', 'CONTADOR'],
            'NFAg': ['CONTADOR'],
            'DTE': ['CONTADOR', 'ADVOGADO', 'IMOBILIARIO'],
            'plataforma': ['CONTADOR'],
            'imóvel': ['IMOBILIARIO', 'CONTADOR'],
            'imovel': ['IMOBILIARIO', 'CONTADOR'],
        }
        
        # Extrai itens de listas (li) e parágrafos (p) na área de conteúdo
        current_section = "Geral"
        
        for elem in content.find_all(["h2", "h3", "li", "p"]):
            if elem.name in ["h2", "h3"]:
                current_section = clean_text(elem.get_text())
                continue
            
            text = clean_text(elem.get_text())
            if not text or len(text) < 20:
                continue
            
            # Detecta se é uma obrigação (contém siglas de documentos fiscais)
            doc_patterns = [
                r'NF-e\b', r'NFC-e\b', r'CT-e\b', r'NFS-e\b', r'NFCom\b',
                r'NF3e\b', r'BP-e\b', r'DeRE\b', r'NF-ABI\b', r'NFAg\b',
                r'DTE\b', r'CNPJ\b'
            ]
            
            matched_doc = None
            for pattern in doc_patterns:
                if re.search(pattern, text):
                    matched_doc = pattern.replace(r'\b', '').replace('\\b', '')
                    break
            
            if not matched_doc:
                continue
            
            # Determina audiência
            audience = audience_map.get(matched_doc, ['CONTADOR'])
            
            # Determina status
            compliance_status = 'EDUCATIVO'
            if 'em construção' in text.lower() or 'leiaute em construção' in text.lower():
                compliance_status = 'EM_CONSTRUCAO'
            elif 'julho de 2026' in text.lower() or 'a partir de julho' in text.lower():
                compliance_status = 'FUTURO'
            
            # Cria título descritivo
            title = f"Obrigação: {matched_doc}"
            if current_section and current_section != "Geral":
                title = f"{matched_doc} — {current_section[:60]}"
            
            items.append({
                "title": title[:200],
                "description": text[:500],
                "reference_title": "Lei Complementar nº 214/2025",
                "audience": audience,
                "compliance_status": compliance_status,
                "penalty_grace_period_end": "2026-12-31" if compliance_status == "EDUCATIVO" else None
            })

        # Remove duplicatas por matched_doc
        seen = set()
        unique_items = []
        for item in items:
            key = item["title"].lower()
            if key not in seen:
                seen.add(key)
                unique_items.append(item)

        logger.info(f"📋 {len(unique_items)} obrigações extraídas")
        return unique_items
