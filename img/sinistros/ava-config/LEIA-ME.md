# Como Ativar o AVA de Sinistros de Trânsito

Para que o Gemini CLI reconheça este subagente globalmente no seu terminal, copie o arquivo `ava-sinistros.md` para a sua pasta de agentes global.

**No Windows PowerShell:**
```powershell
mkdir -Force "$env:USERPROFILE\.gemini\agents"
cp "C:\Users\Jef\Desktop\nei-main\img\sinistros\ava-config\ava-sinistros.md" "$env:USERPROFILE\.gemini\agents\"
```

Após isso, você poderá usar o comando:
`@ava-sinistros crie um novo croqui de batida lateral`

O AVA usará automaticamente o padrão visual profissional (Estilo Pedestre.png) que configuramos.
