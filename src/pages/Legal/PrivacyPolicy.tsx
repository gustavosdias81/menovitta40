import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
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
        <h1 className="page-title">Política de Privacidade</h1>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Last updated */}
        <p className="text-xs text-gray-400">Última atualização: 1º de maio de 2026</p>

        {/* Section 1 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">1. Introdução</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            A Menovitta 4.0 ("nós", "nosso" ou "aplicativo") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e salvaguardamos suas informações quando você usa nosso aplicativo.
          </p>
        </div>

        {/* Section 2 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">2. Dados que Coletamos</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Dados de Cadastro:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nome completo</li>
              <li>Email</li>
              <li>Telefone (opcional)</li>
              <li>Data de nascimento</li>
            </ul>

            <p className="mt-3"><strong>Dados de Saúde:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fase menopáusica (pré, menopáusa, pós)</li>
              <li>Peso e altura (BMI)</li>
              <li>Histórico de sintomas</li>
              <li>Histórico de doenças/medicações</li>
            </ul>

            <p className="mt-3"><strong>Dados de Atividade:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refeições registradas (fotos, calorias, macros)</li>
              <li>Treinos completados (tipo, duração, local)</li>
              <li>Metas nutricionais e de treino</li>
              <li>Histórico de navegação no app</li>
            </ul>

            <p className="mt-3"><strong>Dados de Comunidade:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Posts publicados (texto, fotos)</li>
              <li>Curtidas e interações</li>
              <li>Avatar/foto de perfil</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">3. Como Usamos Seus Dados</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Personalização:</strong> Seus dados são usados para personalizar planos de treino, metas nutricionais e conteúdo da IA adaptado à sua fase menopáusica.</p>
            <p><strong>Análise de Alimentos:</strong> Fotos de refeições são enviadas ao Google Gemini AI para análise nutricional. A foto não é salva após análise.</p>
            <p><strong>Comunidade:</strong> Seus posts e interações ajudam a construir uma comunidade de apoio entre usuárias.</p>
            <p><strong>Melhorias:</strong> Agregamos dados anônimos para melhorar o app e entender tendências em saúde menopáusica.</p>
            <p><strong>Notificações:</strong> Enviamos lembretes e notificações sobre treinos, receitas e artigos científicos.</p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">4. Segurança de Dados</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Armazenamento:</strong> Todos os dados são armazenados no Supabase (banco de dados PostgreSQL hospedado em nível empresarial) com criptografia em repouso (AES-256).</p>
            <p><strong>Transmissão:</strong> Dados são transmitidos via HTTPS/TLS 1.2+.</p>
            <p><strong>Controle de Acesso:</strong> Apenas você pode acessar seus dados pessoais. Administradores podem acessar dados não-sensíveis para análises gerais.</p>
            <p><strong>Fotos:</strong> Fotos de refeições são processadas por Gemini AI e não são armazenadas permanentemente. Apenas o resultado da análise (macros) é salvo.</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">5. Retenção de Dados</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Dados Ativos:</strong> Enquanto sua conta estiver ativa, seus dados serão mantidos.</p>
            <p><strong>Dados Após Exclusão:</strong> Se você solicitar exclusão de conta, todos seus dados pessoais serão deletados permanentemente em até 30 dias. Dados agregados anônimos podem ser mantidos para análises.</p>
            <p><strong>Backup:</strong> Mantemos backups automáticos por 7 dias para fins de recuperação, após o qual são deletados.</p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">6. Compartilhamento de Dados</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Nós <strong>NUNCA</strong> compartilhamos seus dados pessoais com terceiros. Dados são usados exclusivamente para:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mt-2">
            <li>Google Gemini API (análise de fotos apenas)</li>
            <li>Supabase (armazenamento seguro)</li>
            <li>Seu próprio perfil na comunidade (voluntário)</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">7. Seus Direitos</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Acesso:</strong> Você tem o direito de acessar todos seus dados pessoais armazenados.</p>
            <p><strong>Correção:</strong> Você pode atualizar ou corrigir seus dados a qualquer momento em Settings.</p>
            <p><strong>Exclusão:</strong> Você pode solicitar exclusão completa de sua conta e dados. Contate: suporte@menovitta.com.br</p>
            <p><strong>Portabilidade:</strong> Você pode solicitar uma cópia de seus dados em formato padrão.</p>
          </div>
        </div>

        {/* Section 8 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">8. Fase Beta</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Menovitta 4.0 está em fase beta. Isso significa que funcionalidades podem mudar, haver bugs, e sua experiência pode não ser perfeita. Continuamos coletando feedback para melhorar. Seus dados estão seguros e serão mantidos.
          </p>
        </div>

        {/* Section 9 */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">9. Contato</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p>Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:</p>
            <p className="font-semibold">Email: suporte@menovitta.com.br</p>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}
