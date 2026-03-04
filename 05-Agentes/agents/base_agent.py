"""
base_agent.py — Classe base para todos os sub-agentes do ATLAS

Todo sub-agente herda desta classe e implementa:
  - fetch()  → busca dados brutos da fonte
  - parse()  → transforma HTML/JSON em dicts estruturados
"""

import abc
from datetime import datetime
from loguru import logger


class BaseAgent(abc.ABC):
    """Classe base abstrata para sub-agentes de coleta."""
    
    name: str = "unnamed"
    description: str = ""
    source_url: str = ""
    target_table: str = "legal_references"
    schedule: str = "manual"  # "daily", "weekly", "manual"
    
    def __init__(self):
        self._results = {
            "fetched": 0,
            "new": 0,
            "would_insert": 0,
            "skipped": 0,
            "errors": [],
            "started_at": None,
            "finished_at": None
        }

    # ── Métodos abstratos ──────────────────────────────────

    @abc.abstractmethod
    def fetch(self) -> str:
        """Busca o conteúdo bruto (HTML) da fonte. Retorna string."""
        ...

    @abc.abstractmethod
    def parse(self, raw_html: str) -> list[dict]:
        """
        Transforma HTML bruto em uma lista de dicts prontos para inserção.
        Cada dict deve ter as colunas da tabela alvo.
        """
        ...

    # ── Métodos concretos ──────────────────────────────────

    def deduplicate(self, items: list[dict], existing_titles: list[str]) -> list[dict]:
        """Remove itens cujo título já existe no banco."""
        existing_lower = {t.lower().strip() for t in existing_titles}
        new_items = []
        for item in items:
            title = item.get("title", "").lower().strip()
            if title and title not in existing_lower:
                new_items.append(item)
            else:
                self._results["skipped"] += 1
                logger.debug(f"⏭️  Pulando (já existe): {item.get('title', '?')[:60]}")
        return new_items

    def get_existing_titles(self, supabase_client) -> list[str]:
        """Busca todos os títulos existentes na tabela alvo."""
        if not supabase_client:
            return []
        try:
            response = supabase_client.table(self.target_table).select("title").execute()
            return [row["title"] for row in (response.data or [])]
        except Exception as e:
            logger.error(f"Erro ao buscar títulos existentes: {e}")
            return []

    def save(self, items: list[dict], supabase_client) -> int:
        """Insere itens no Supabase. Retorna quantidade inserida."""
        if not supabase_client or not items:
            return 0
        
        inserted = 0
        for item in items:
            try:
                supabase_client.table(self.target_table).insert(item).execute()
                inserted += 1
                logger.info(f"✅ Inserido: {item.get('title', '?')[:60]}")
            except Exception as e:
                self._results["errors"].append(str(e))
                logger.error(f"❌ Erro ao inserir '{item.get('title', '?')[:60]}': {e}")
        
        return inserted

    def run(self, supabase_client=None) -> dict:
        """
        Pipeline completo: fetch → parse → deduplicate → save.
        Retorna dict com estatísticas da execução.
        """
        self._results["started_at"] = datetime.now().isoformat()
        logger.info(f"🚀 Iniciando agente: {self.name}")
        logger.info(f"   Fonte: {self.source_url}")
        
        try:
            # 1. Fetch
            raw_html = self.fetch()
            if not raw_html:
                logger.warning(f"⚠️  Nenhum conteúdo retornado de {self.source_url}")
                self._results["finished_at"] = datetime.now().isoformat()
                return self._results
            
            # 2. Parse
            items = self.parse(raw_html)
            self._results["fetched"] = len(items)
            logger.info(f"📦 {len(items)} itens extraídos da fonte")
            
            if not items:
                self._results["finished_at"] = datetime.now().isoformat()
                return self._results
            
            # 3. Deduplicate
            if supabase_client:
                existing = self.get_existing_titles(supabase_client)
                items = self.deduplicate(items, existing)
                logger.info(f"🆕 {len(items)} itens novos após deduplicação")
            
            # 4. Save
            if supabase_client and items:
                inserted = self.save(items, supabase_client)
                self._results["new"] = inserted
                self._results["would_insert"] = inserted
            else:
                # Modo dry-run (sem Supabase)
                self._results["new"] = 0
                self._results["would_insert"] = len(items)
                for item in items:
                    logger.info(f"🔍 [DRY-RUN] {item.get('title', '?')[:60]}")
        
        except Exception as e:
            self._results["errors"].append(str(e))
            logger.error(f"💥 Erro no agente {self.name}: {e}")
        
        self._results["finished_at"] = datetime.now().isoformat()
        return self._results

    def report(self) -> str:
        """Gera relatório textual do resultado."""
        r = self._results
        lines = [
            f"━━━ Relatório: {self.name} ━━━",
            f"  Fonte: {self.source_url}",
            f"  Extraídos: {r['fetched']}",
            f"  Novos inseridos: {r['new']}",
            f"  Potenciais inserções (dry-run): {r['would_insert']}",
            f"  Já existentes (pulados): {r['skipped']}",
            f"  Erros: {len(r['errors'])}",
        ]
        if r["errors"]:
            for err in r["errors"][:3]:
                lines.append(f"    ⚠️  {err[:100]}")
        if r["started_at"] and r["finished_at"]:
            lines.append(f"  Início: {r['started_at']}")
            lines.append(f"  Fim: {r['finished_at']}")
        return "\n".join(lines)
