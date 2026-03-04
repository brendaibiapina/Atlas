"""
rfb_marcos_agent.py — Sub-agente que coleta marcos regulatórios da Reforma

Fonte: https://www.gov.br/receitafederal/.../reforma-consumo/marcos
Tabela alvo: legal_references
"""

from agents.base_agent import BaseAgent
from utils.scraper import fetch_page
from utils.parser import soupify, clean_text, extract_date_from_title, extract_source_type, generate_tags
from config import RFB_MARCOS_URL
from loguru import logger


class RFBMarcosAgent(BaseAgent):
    name = "rfb_marcos"
    description = "Monitora novos marcos regulatórios (ECs, LCs, Portarias) da Reforma Tributária"
    source_url = RFB_MARCOS_URL
    target_table = "legal_references"
    schedule = "weekly"

    def fetch(self) -> str:
        return fetch_page(self.source_url)

    def parse(self, raw_html: str) -> list[dict]:
        """
        Extrai marcos regulatórios da página /marcos.
        Cada marco aparece como um link + texto descritivo.
        Padrão: <a href="...">Portaria RFB nº 549, de 13 de junho de 2025</a>Descrição...
        """
        soup = soupify(raw_html)
        items = []
        
        content = soup.find("div", {"id": "content-core"}) or soup.find("article") or soup

        # Busca todos os links que apontam para normas legais
        legal_domains = [
            "planalto.gov.br",
            "normasinternet2.receita.fazenda.gov.br",
            "normas.receita.fazenda.gov.br",
            "legislacao.planalto.gov.br"
        ]

        for link in content.find_all("a"):
            href = link.get("href", "")
            
            # Só processa links de normas legais
            if not any(domain in href for domain in legal_domains):
                continue
            
            title = clean_text(link.get_text())
            if not title or len(title) < 10:
                continue
            
            # Busca a descrição (texto que vem logo após o link)
            description = ""
            
            # Tenta pegar o texto do elemento pai que não é do link
            parent = link.parent
            if parent:
                full_parent_text = clean_text(parent.get_text())
                if len(full_parent_text) > len(title):
                    description = full_parent_text[len(title):].strip()
            
            # Se não achou descrição, tenta o próximo sibling
            if not description:
                next_sibling = link.next_sibling
                if next_sibling and isinstance(next_sibling, str):
                    description = clean_text(next_sibling)
            
            # Extrai data do título da norma
            pub_date = extract_date_from_title(title)
            if not pub_date:
                # Tenta da descrição
                pub_date = extract_date_from_title(description) if description else None
            
            source_type = extract_source_type(title)
            
            items.append({
                "title": title[:200],
                "source_type": source_type,
                "publication_date": pub_date,
                "summary": description[:500] if description else f"Marco regulatório: {title}",
                "status": "VIGENTE",
                "tags": generate_tags(title, description),
                "full_text_url": href
            })

        # Remove duplicatas por URL
        seen_urls = set()
        unique_items = []
        for item in items:
            url = item.get("full_text_url", "")
            if url not in seen_urls:
                seen_urls.add(url)
                unique_items.append(item)
        
        logger.info(f"📜 {len(unique_items)} marcos regulatórios extraídos")
        return unique_items
