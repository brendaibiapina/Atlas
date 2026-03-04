// src/lib/email-templates.ts

export const Templates = {

    welcome: (name: string) => `
    <div style="font-family: sans-serif; color: #1F2937; max-w: 600px; margin: 0 auto;">
      <h1 style="color: #1F2937;">Bem-vindo ao Atlas, ${name}.</h1>
      <p>Sua conta foi criada. A partir de agora, você monitora a Reforma Tributária com a segurança da fonte oficial.</p>
      <a href="https://atlas-reforma.com.br/dashboard" style="display: inline-block; background: #1F2937; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Acessar Painel</a>
    </div>
  `,

    alertImmediate: (title: string, description: string, url: string) => `
    <div style="font-family: sans-serif; color: #1F2937; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background: #F9FAFB; padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: #EF4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NOVA NORMA</span>
        <h2 style="margin: 10px 0 0 0; font-size: 20px;">${title}</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.5;">${description}</p>
        <div style="margin-top: 20px; background: #FEF2F2; padding: 15px; border-radius: 4px; color: #991B1B; font-size: 14px;">
          <strong>Por que importa:</strong> Esta norma tem impacto imediato nas obrigações acessórias de 2026.
        </div>
        <a href="${url}" style="display: block; margin-top: 20px; text-align: center; background: #1F2937; color: #fff; padding: 12px; text-decoration: none; border-radius: 4px;">Ler Fonte Oficial</a>
      </div>
    </div>
  `,

    weeklyDigest: (eventsCount: number, highlights: string[]) => `
    <div style="font-family: sans-serif; color: #1F2937; max-w: 600px; margin: 0 auto;">
      <h2 style="color: #B45309;">Resumo da Semana</h2>
      <p>Olá. Tivemos <strong>${eventsCount} novas atualizações</strong> oficiais nos últimos 7 dias.</p>
      <ul>
        ${highlights.map(h => `<li style="margin-bottom: 10px;">${h}</li>`).join('')}
      </ul>
      <a href="https://atlas-reforma.com.br/dashboard" style="color: #B45309;">Ver detalhes no painel &rarr;</a>
    </div>
  `
};
