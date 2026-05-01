import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="page-container pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/configuracoes')}
          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="page-title">Termos de Serviço</h1>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Last updated */}
        <p className="text-xs text-gray-400">Última atualização: 1º de maio de 2026</p>

        {/* Section 1 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">1. Aceito dos Termos</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Ao acessar e usar o Menovitta 4.0, você concorda em estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, você não poderá usar o aplicativo.
          </p>
        </div>

        {/* Section 2 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">2. Fase Beta</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            <strong>IMPORTANTE:</strong> Menovitta 4.0 é fornecido em fase beta ("AS-IS"), sem garantias de nenhum tipo, expressas ou implícitas.
          </p>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Você reconhece que:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>O aplicativo pode conter bugs, erros ou funcionalidades incompletas</li>
              <li>Funcionalidades podem mudar ou ser removidas a qualquer momento</li>
              <li>O serviço pode estar indisponível periodicamente</li>
              <li>Seus dados podem ser afetados por atualizações</li>
              <li>Não há garantia de continuidade do serviço</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">3. Isenção de Responsabilidade Médica</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-red-600">⚠️ AVISO IMPORTANTE:</p>
            <p>
              Menovitta 4.0 <strong>NÃO é um serviço médico</strong>. O aplicativo fornece informações educacionais e recomendações gerais sobre fitness, nutrição e bem-estar durante a menopausa. <strong>Não substitui consulta médica profissional.</strong>
            </p>
            <p className="mt-2">
              <strong>Você é responsável por:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Consultar seu médico ou nutricionista antes de iniciar qualquer novo programa de exercício ou dieta</li>
              <li>Relatar qualquer condição médica pré-existente</li>
              <li>Parar exercícios se sentir dor ou desconforto</li>
              <li>Seguir as recomendações de profissionais de saúde</li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">4. Uso Adequado</h2>
          <p className="text-sm text-gray-700 mb-2">Você concorda em usar Menovitta 4.0 somente para fins legais e apropriados. Você não deve:</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Usar o aplicativo de forma que viole leis ou direitos de terceiros</li>
            <li>Enviar conteúdo abusivo, ofensivo ou ilegal</li>
            <li>Tentar acessar dados de outros usuários</li>
            <li>Executar ataques de negação de serviço ou hacking</li>
            <li>Copiar ou reproduzir conteúdo sem permissão</li>
            <li>Impersonar outro usuário</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">5. Contas de Usuário</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>Você é responsável por:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Manter informações de conta precisas</li>
              <li>Toda atividade em sua conta</li>
              <li>Notificar-nos imediatamente sobre uso não autorizado</li>
            </ul>
          </div>
        </div>

        {/* Section 6 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">6. Conteúdo do Usuário</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Qualquer conteúdo que você postar (posts, fotos, comentários) é de sua responsabilidade. Você garante que:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Você possui direitos sobre o conteúdo</li>
              <li>O conteúdo não viola direitos de terceiros</li>
              <li>O conteúdo não é obsceno ou ofensivo</li>
            </ul>
            <p className="mt-2">
              Reservamos o direito de remover conteúdo que viole estes termos.
            </p>
          </div>
        </div>

        {/* Section 7 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">7. Limitação de Responsabilidade</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>NA MÁXIMA EXTENSÃO PERMITIDA POR LEI:</strong> Menovitta 4.0 não será responsável por qualquer dano direto, indireto, acidental, especial, consequente ou punitivo resultante do uso ou incapacidade de usar o aplicativo, mesmo se avisado sobre a possibilidade de tais danos.
          </p>
        </div>

        {/* Section 8 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">8. Modificações dos Termos</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Podemos modificar estes termos a qualquer momento. Mudanças materiais serão comunicadas via email ou notificação no app. Seu uso continuado do app após modificações significa que você aceita os novos termos.
          </p>
        </div>

        {/* Section 9 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">9. Encerramento</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>Você pode encerrar sua conta a qualquer momento solicitando via Settings ou email.</p>
            <p>
              Podemos encerrar ou suspender sua conta se você violar estes termos ou envolver-se em atividades que prejudiquem o serviço.
            </p>
          </div>
        </div>

        {/* Section 10 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">10. Governança</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Estes termos serão governados pelas leis da República Federativa do Brasil, sem consideração a seus conflitos de disposições de lei.
          </p>
        </div>

        {/* Section 11 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">11. Contato</h2>
          <p className="text-sm text-gray-700 mb-2">Se você tiver dúvidas sobre estes Termos de Serviço:</p>
          <p className="text-sm font-semibold">Email: suporte@menovitta.com.br</p>
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}
