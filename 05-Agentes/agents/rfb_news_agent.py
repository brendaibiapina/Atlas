"""
rfb_news_agent.py — Sub-agente que coleta notícias da RFB sobre a Reforma Tributária

Fonte: https://www.gov.br/receitafederal/.../reforma-consumo/noticias
Tabela alvo: legal_references
"""

import re
from datetime import datetime
from agents.base_agent import BaseAgent
from utils.scraper import fetch_page
from utils.parser import soupify, clean_text, generate_tags
from config import RFB_NOTICIAS_URL
from loguru import logger


class RFBNewsAgent(BaseAgent):
    name = "rfb_news"
    description = "Coleta notícias oficiais da RFB sobre a Reforma Tributária do Consumo"
    source_url = RFB_NOTICIAS_URL
    target_table = "legal_references"
    schedule = "daily"

    def fetch(self) -> str:
        return fetch_page(self.source_url)

    def parse(self, raw_html: str) -> list[dict]:
        """
        Extrai notícias da página de notícias da RFB sobre a Reforma.
        A página usa <h2> com links para cada notícia, seguido de texto descritivo.
        """
        soup = soupify(raw_html)
        items = []

        # A página de notícias usa headers h2 com links
        content_area = soup.find("div", {"id": "content-core"}) or soup.find("article") or soup
        
        news_links = []
        
        # Busca links dentro de h2 ou h3 que apontam para /noticias/
        for heading in content_area.find_all(["h2", "h3"]):
            link = heading.find("a")
            if link and link.get("href"):
                href = link["href"]
                # Só interessa notícias da RFB sobre reforma
                if "/noticias/" in href or "/assuntos/noticias/" in href:
                    news_links.append({
                        "title": clean_text(link.get_text()),
                        "url": href if href.startswith("http") else f"https://www.gov.br{href}"
                    })

        # Para cada notícia, tenta extrair a descrição (próximo sibling de texto)
        for heading in content_area.find_all(["h2", "h3"]):
            link = heading.find("a")
            if not link:
                continue
            
            title = clean_text(link.get_text())
            href = link.get("href", "")
            
            if not ("/noticias/" in href or "/assuntos/noticias/" in href):
                continue
            
            # Busca descrição no texto após o heading
            description = ""
            next_elem = heading.find_next_sibling()
            if next_elem and next_elem.name in ["p", "div", "span"]:
                description = clean_text(next_elem.get_text())
            
            if not description:
                # Tenta pegar texto direto do heading
                full_text = clean_text(heading.get_text())
                if len(full_text) > len(title):
                    description = full_text[len(title):].strip()
            
            if not title:
                continue

            # Extrai data da URL (padrão: /2026/fevereiro/ ou /2026/janeiro/)
            pub_date = self._extract_date_from_url(href)
            
            url = href if href.startswith("http") else f"https://www.gov.br{href}"

            items.append({
                "title": title[:200],
                "source_type": "RFB",
                "publication_date": pub_date,
                "summary": description[:500] if description else title,
                "status": "VIGENTE",
                "tags": generate_tags(title, description),
                "full_text_url": url
            })

        # Remove duplicatas por título
        seen = set()
        unique_items = []
        for item in items:
            key = item["title"].lower().strip()
            if key not in seen:
                seen.add(key)
                unique_items.append(item)
        
        logger.info(f"📰 {len(unique_items)} notícias únicas extraídas")
        return unique_items

    def _extract_date_from_url(self, url: str) -> str:
        """Extrai data aproximada da URL. Ex: /2026/fevereiro/ → 2026-02-01"""
        meses = {
            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03',
            'abril': '04', 'maio': '05', 'junho': '06',
            'julho': '07', 'agosto': '08', 'setembro': '09',
            'outubro': '10', 'novembro': '11', 'dezembro': '12'
        }
        
        pattern = r'/(\d{4})/(\w+)/'
        match = re.search(pattern, url.lower())
        if match:
            year = match.group(1)
            month_name = match.group(2)
            month = meses.get(month_name, '01')
            return f"{year}-{month}-01"
        
        return datetime.now().strftime("%Y-%m-%d")
