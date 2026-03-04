"""
dou_monitor_agent.py — Sub-agente que monitora o Diário Oficial da União

Busca publicações recentes do DOU relacionadas à Reforma Tributária,
CBS, IBS, Imposto Seletivo e temas correlatos.

Fonte: https://www.in.gov.br/consulta (API de busca)
Tabela alvo: legal_references
"""

import re
from datetime import datetime, timedelta
from agents.base_agent import BaseAgent
from utils.scraper import fetch_page
from utils.parser import soupify, clean_text, generate_tags, extract_date_from_text
from loguru import logger

# A API de busca do DOU é acessível via URL com parâmetros
DOU_SEARCH_URL = "https://www.in.gov.br/servicos/diario-oficial-da-uniao/pesquisa"
DOU_API_URL = "https://www.in.gov.br/consulta/-/buscar/dou"

# Palavras-chave para buscar no DOU
KEYWORDS = [
    "CBS", "IBS", "Imposto Seletivo",
    "Reforma Tributária", "Lei Complementar 214",
    "NF-e CBS", "NFS-e IBS",
    "obrigações acessórias reforma",
]


class DOUMonitorAgent(BaseAgent):
    name = "dou_monitor"
    description = "Monitora publicações do Diário Oficial da União sobre Reforma Tributária (CBS, IBS, IS)"
    source_url = DOU_SEARCH_URL
    target_table = "legal_references"
    schedule = "daily"

    def fetch(self) -> str:
        """
        Busca o DOU por palavras-chave da Reforma Tributária.
        Usa a página de pesquisa do DOU.
        """
        # Busca pela página de pesquisa do DOU
        # URL com parâmetro de busca
        search_term = "Reforma+Tributária+Consumo"
        url = f"https://www.in.gov.br/consulta/-/buscar/dou?q={search_term}&s=todos&exactDate=mes&sortType=0"
        
        html = fetch_page(url, timeout=30)
        if html:
            return html
        
        # Fallback: tenta diretamente a página do DOU
        logger.warning("⚠️  Busca do DOU não retornou resultado, tentando página principal")
        return fetch_page("https://www.in.gov.br/leiturajornal?data=" + datetime.now().strftime("%d-%m-%Y"), timeout=30)

    def parse(self, raw_html: str) -> list[dict]:
        """Extrai publicações relevantes dos resultados de busca do DOU."""
        soup = soupify(raw_html)
        items = []

        # O DOU retorna resultados em divs com classes específicas
        # Busca por resultados de pesquisa
        results = soup.find_all("div", class_="resultado-busca") or \
                  soup.find_all("div", class_="resultados-colunas") or \
                  soup.find_all("div", class_="materia")

        for result in results:
            # Tenta extrair título
            title_elem = result.find(["h5", "h4", "h3", "a", "p"], class_=lambda c: c and ("titulo" in str(c).lower() or "title" in str(c).lower()))
            if not title_elem:
                title_elem = result.find("a")
            
            if not title_elem:
                continue
            
            title = clean_text(title_elem.get_text())
            if not title or len(title) < 15:
                continue
            
            # Filtra por relevância (deve conter palavras-chave da reforma)
            text_lower = title.lower()
            is_relevant = any(kw.lower() in text_lower for kw in [
                "cbs", "ibs", "imposto seletivo", "reforma tributária",
                "lei complementar 214", "reforma do consumo",
                "contribuição sobre bens", "imposto sobre bens"
            ])
            
            if not is_relevant:
                # Checa o resumo/ementa
                summary_elem = result.find(["p", "span", "div"], class_=lambda c: c and ("ementa" in str(c).lower() or "resumo" in str(c).lower()))
                if summary_elem:
                    summary_text = clean_text(summary_elem.get_text())
                    is_relevant = any(kw.lower() in summary_text.lower() for kw in [
                        "cbs", "ibs", "imposto seletivo", "reforma tributária",
                        "contribuição sobre bens"
                    ])
                    if is_relevant:
                        title = f"{title}"
            
            if not is_relevant:
                continue
            
            # Extrai link
            link = title_elem.find("a") if title_elem.name != "a" else title_elem
            href = ""
            if link and link.get("href"):
                href = link["href"]
                if not href.startswith("http"):
                    href = f"https://www.in.gov.br{href}"
            
            # Extrai data
            date_elem = result.find(["span", "p"], class_=lambda c: c and "data" in str(c).lower())
            pub_date = None
            if date_elem:
                pub_date = extract_date_from_text(clean_text(date_elem.get_text()))
            if not pub_date:
                pub_date = datetime.now().strftime("%Y-%m-%d")
            
            # Extrai resumo/ementa
            summary = ""
            ementa = result.find(["p", "div"], class_=lambda c: c and ("ementa" in str(c).lower() or "resumo" in str(c).lower()))
            if ementa:
                summary = clean_text(ementa.get_text())[:500]
            if not summary:
                summary = title
            
            items.append({
                "title": f"[DOU] {title}"[:200],
                "source_type": "DOU",
                "publication_date": pub_date,
                "summary": summary,
                "status": "VIGENTE",
                "tags": generate_tags(title, summary),
                "full_text_url": href
            })

        # Se não encontrou resultados estruturados, tenta extrair de links gerais
        if not items:
            logger.info("🔍 Tentando extração alternativa de links do DOU...")
            for link in soup.find_all("a"):
                href = link.get("href", "")
                text = clean_text(link.get_text())
                
                if not text or len(text) < 20:
                    continue
                
                text_lower = text.lower()
                if any(kw.lower() in text_lower for kw in ["cbs", "ibs", "reforma tributária", "imposto seletivo"]):
                    full_url = href if href.startswith("http") else f"https://www.in.gov.br{href}"
                    items.append({
                        "title": f"[DOU] {text}"[:200],
                        "source_type": "DOU",
                        "publication_date": datetime.now().strftime("%Y-%m-%d"),
                        "summary": text[:500],
                        "status": "VIGENTE",
                        "tags": generate_tags(text),
                        "full_text_url": full_url
                    })

        # Remove duplicatas
        seen = set()
        unique = []
        for item in items:
            key = item["title"].lower().strip()
            if key not in seen:
                seen.add(key)
                unique.append(item)

        logger.info(f"📰 {len(unique)} publicações relevantes do DOU")
        return unique
