import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Info,
  ArrowLeft,
  Home,
  Newspaper,
  User,
  FileText,
  History,
  X,
  CircleHelp,
  ShieldCheck,
} from 'lucide-react';
import { calculateTax, calculateAnnualTax } from './utils/taxCalc';
import { TaxResult, AnnualTaxResult, AnnualTaxInput } from './types';
import { TAX_BRACKETS, ANNUAL_TAX_BRACKETS } from './constants';

type ViewState = 'home' | 'monthly' | 'annual' | 'profile';

const NavBar = ({ activeView, setView }: { activeView: ViewState; setView: (v: ViewState) => void }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-3 px-6 z-50">
    <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${activeView === 'home' ? 'text-[#1D438A]' : 'text-gray-400'}`}>
      <Home className="w-6 h-6" />
      <span className="text-[10px] font-bold">首页</span>
    </button>
    <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 ${activeView === 'profile' ? 'text-[#1D438A]' : 'text-gray-400'}`}>
      <Info className="w-6 h-6" />
      <span className="text-[10px] font-bold">关于</span>
    </button>
  </div>
);

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <header className="bg-white pt-10 pb-4 px-6 sticky top-0 z-40 border-b border-gray-50">
    <div className="flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="p-1 -ml-2 text-gray-400 hover:text-[#1D438A] hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : <div className="w-5 h-5" />}
      <h1 className="text-base font-bold text-gray-900 flex-1 text-center">{title}</h1>
      <div className="w-5 h-5" />
    </div>
  </header>
);

const SectionHeader = ({ title, more }: { title: string; more?: string }) => (
  <div className="flex justify-between items-center mb-3 mt-6">
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-[#1D438A] rounded-full" />
      <h2 className="text-sm font-extrabold text-[#1D438A]">{title}</h2>
    </div>
    {more && <button className="text-xs font-medium text-gray-400">{more}</button>}
  </div>
);

const DEDUCTION_CONTENT = `
# 个税专项附加扣除7项·一页速查表

## 一、7项扣除标准&适用条件

| 扣除项目 | 每月扣除标准 | 适用条件关键要点 | 重要规则 |
| :--- | :--- | :--- | :--- |
| 3岁以下婴幼儿照护 | 2000元/每孩 | 从宝宝出生当月至满3周岁前 | 父母一方全额扣，或各扣50%，**全年不能改分摊比例** |
| 子女教育 | 2000元/每孩 | 3周岁至博士研究生，全日制教育 | 和婴幼儿照护分摊规则一致，多孩按个数叠加 |
| 继续教育 | 学历400元/月<br>职业资格3600元/年 | 学历继续教育、职业资格证书取证当年 | 学历最长扣48个月；本科以下可由父母扣除 |
| 住房贷款利息 | 1000元/月 | 本人/配偶首套住房贷款 | 最长扣240个月，**和房租只能二选一** |
| 租房租金 | 一线1500/中等1100/小城市800 | 工作城市无自有住房，租房居住 | 按工作城市分级，**不得和房贷利息同时享受** |
| 赡养老人 | 独生3000/非独生3000(分摊) | 年满60周岁父母、祖父母、外祖父母 | 非独生子女每人每月最多扣1500元 |
| 大病医疗 | 年度限额80000元 | 医保报销后，个人自付累计超15000元部分 | **只能次年汇算申报**，夫妻、未成年子女可合并扣除 |

## 二、申报流程
1. 打开「个人所得税」APP → 点击**办税**
2. 进入**专项附加扣除填报**
3. 选定**扣除年度**，勾选要填报的项目
4. 按提示填写信息、上传相关资料
5. 申报方式选择：**扣缴义务人申报**（发工资直接抵税）或**年度自行申报**

## 三、必备填报材料清单
1. 子女：出生证明、学籍信息
2. 房贷：购房合同、贷款合同
3. 租房：租房合同、房东信息
4. 赡养老人：身份信息、分摊协议
5. 继续教育：学籍、证书
6. 大病医疗：医保结算单、费用票据

## 四、必记易错点
1. 房贷、房租**不能同时申报**；
2. 扣除分摊比例**一个纳税年度内不能变更**；
3. 大病医疗不按月抵扣，只能第二年汇算退税；
4. 多孩家庭，每孩都能享受。
`;

const GenericModal = ({ isOpen, onClose, title, content }: { isOpen: boolean; onClose: () => void; title: string, content: string }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[32px] z-70 shadow-2xl flex flex-col"
        >
          <div className="p-6 pb-2 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white rounded-t-[32px]">
            <h2 className="text-base font-black text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const DeductionInfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <GenericModal isOpen={isOpen} onClose={onClose} title="专项附加扣除说明" content={DEDUCTION_CONTENT} />
);

const PrivacyPolicyContent = () => (
  <div className="max-w-none">
    <h1 className="text-2xl font-bold text-[#1D438A] text-center mb-2">🔒 隐私政策</h1>
    <p className="text-center text-gray-500 mb-6"><strong>生效日期</strong>：2026年05月06日</p>

    <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-[#1D438A] mb-6">
      <p className="text-gray-700">欢迎使用「飞序个税助手」（以下简称"本应用"）。本应用由<strong>光年跃迁（温州）科技有限公司</strong>（以下简称"我们"）开发并运营。我们深知个人信息对您的重要性，将严格遵守《中华人民共和国个人信息保护法》等相关法律法规，保护您的个人信息安全。</p>
    </div>

    <p className="mb-6 text-gray-700">本隐私政策旨在说明我们如何收集、使用、存储和保护您在使用本应用过程中提供的个人信息，以及您对这些信息所享有的权利。请您在使用本应用前仔细阅读并充分理解本政策的全部内容，尤其是加粗的条款。如您对本政策有任何疑问、意见或建议，可通过本政策末尾提供的联系方式与我们联系。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">一、我们收集的信息</h2>
    <p className="mb-4 text-gray-700">本应用是一款<strong>本地化个人所得税计算工具</strong>。您输入的工资、奖金、五险一金及专项附加扣除等所有税务相关数据，<strong>均仅在您本地浏览器中进行即时计算，我们不会将这些信息上传至任何服务器或第三方机构</strong>。</p>
    <p className="mb-4 text-gray-700">在您使用本应用的过程中，我们不会收集任何能够识别您个人身份的信息，包括但不限于：</p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-gray-700"><strong>本地计算</strong>：您输入的月税前收入、五险一金、专项附加扣除等数据，仅在您的设备本地进行计算处理。</li>
      <li className="mb-3 text-gray-700"><strong>不存储数据</strong>：本应用不保存您的任何计算记录或财务数据，关闭页面后所有数据将自动清除。</li>
      <li className="mb-3 text-gray-700"><strong>设备信息</strong>：为保障应用基本运行，我们仅收集必要的设备信息用于界面适配，不包含任何可追踪您身份的信息。</li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">二、我们如何使用收集的信息</h2>
    <p className="mb-4 text-gray-700">由于本应用不收集您的个人财务数据，我们仅使用必要的设备信息用于：</p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-gray-700"><strong>界面适配</strong>：根据您的设备屏幕尺寸，提供合适的界面布局。</li>
      <li className="mb-3 text-gray-700"><strong>应用稳定</strong>：确保应用在各设备上能够正常运行。</li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">三、我们如何共享、转让和公开披露信息</h2>
    <p className="mb-4 text-gray-700">由于本应用不收集您的任何个人信息，因此不存在向第三方共享、转让或公开披露信息的情形。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">四、我们如何存储和保护信息</h2>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-gray-700"><strong>数据存储</strong>：本应用不存储您的任何个人数据。所有计算均在本地即时完成，关闭页面后数据自动清除。</li>
      <li className="mb-3 text-gray-700"><strong>安全措施</strong>：由于数据不经过服务器传输，您的财务信息始终保存在您的本地设备上，安全可靠。</li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">五、您的权利</h2>
    <p className="mb-4 text-gray-700">根据相关法律法规，您对您的个人信息享有以下权利：</p>
    <ol className="list-decimal pl-6 mb-6">
      <li className="mb-3 text-gray-700"><strong>数据控制权</strong>：本应用不存储您的任何数据，所有数据仅存在于当前会话中，您关闭页面即可彻底销毁。</li>
      <li className="mb-3 text-gray-700"><strong>无痕使用</strong>：您可以随时关闭页面清除所有数据，我们无法获取您的任何信息。</li>
    </ol>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">六、未成年人保护</h2>
    <p className="mb-6 text-gray-700">我们非常重视对未成年人个人信息的保护。如您是未满14周岁的未成年人，在使用本应用前，应在监护人的指导下仔细阅读本政策。如我们发现自己在未事先获得监护人可验证同意的情况下收集了未成年人的个人信息，将立即删除相关数据。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">七、本政策的更新</h2>
    <p className="mb-6 text-gray-700">我们可能会根据法律法规的更新、业务的调整或技术的发展，适时对本隐私政策进行修订。修订后的政策将在本应用内显著位置公示，并在生效前通过合理方式通知您。如您继续使用本应用，即表示您同意接受修订后的政策。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4 border-b-2 border-gray-200 pb-2">八、联系我们</h2>
    <p className="mb-4 text-gray-700">如您对本隐私政策有任何疑问、意见或建议，或需要行使您的相关权利，请通过以下方式与我们联系：</p>
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <p className="mb-2 text-gray-700"><strong>电子邮箱</strong>：Jp112022@163.com</p>
    </div>

    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
      <p className="mb-2 text-gray-500">感谢您使用飞序个税助手！</p>
      <p className="mb-4 text-gray-500">我们致力于为您提供安全、便捷的个人所得税计算服务。</p>
      <p className="text-sm text-gray-400">© 2026 光年跃迁（温州）科技有限公司 版权所有</p>
    </div>
  </div>
);

const UserAgreementContent = () => (
  <div className="prose max-w-none">
    <h1 className="text-2xl font-bold text-[#1D438A] text-center mb-4">用户服务协议</h1>
    <p className="text-center text-gray-500 mb-8">更新日期：2026年05月06日</p>

    <h2 className="text-xl font-semibold mt-8 mb-4">1. 协议的接受</h2>
    <p>欢迎使用「飞序个税助手」应用（以下简称「本应用」）。</p>
    <p>本协议是您与光年跃迁（温州）科技有限公司（以下简称「我们」）之间关于使用本应用的法律协议。</p>
    <p>通过下载、安装或使用本应用，您表示同意接受本协议的全部条款和条件。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4">2. 服务内容</h2>
    <p>本应用提供以下服务：</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>个人所得税按月计算</li>
      <li>年度汇算清缴计算</li>
      <li>专项附加扣除说明查询</li>
      <li>最新税率速查</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-4">3. 用户义务</h2>
    <p>作为本应用的用户，您同意：</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>遵守本协议的所有条款</li>
      <li>不使用本应用进行任何非法活动</li>
      <li>不干扰本应用的正常运行</li>
      <li>保护您的设备安全，防止未授权访问</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-4">4. 知识产权</h2>
    <p>本应用的所有内容，包括但不限于文字、图像、音频、视频、软件等，均受知识产权法律保护。</p>
    <p>未经我们的书面许可，您不得复制、修改、分发或商业使用本应用的任何内容。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4">5. 免责声明</h2>
    <p>本应用按「原样」提供，不做任何形式的保证。</p>
    <p>本应用的所有计算结果仅供参考，实际应纳税额以税务机关最终核定为准。我们不保证：</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>本应用将符合您的要求</li>
      <li>本应用将无中断、及时、安全或无错误地运行</li>
      <li>本应用的使用结果将是准确或可靠的</li>
    </ul>

    <h2 className="text-xl font-semibold mt-8 mb-4">6. 终止</h2>
    <p>我们有权在任何时候，出于任何原因，终止或暂停您对本应用的访问。</p>
    <p>您也可以随时停止使用本应用。</p>

    <h2 className="text-xl font-semibold mt-8 mb-4">7. 适用法律</h2>
    <p>本协议受中华人民共和国法律管辖。</p>
    <p>任何与本协议相关的争议，应通过友好协商解决；协商不成的，应提交至温州市有管辖权的人民法院诉讼解决。</p>
  </div>
);

const PrivacyModal = ({ onAccept, onDecline, onOpenAgreement, onOpenPrivacy }: {
  onAccept: () => void,
  onDecline: () => void,
  onOpenAgreement: () => void,
  onOpenPrivacy: () => void
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto rounded-[28px]"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#1D1D1F] mb-6 text-center pt-4">
          用户协议与隐私政策
        </h3>
        <div className="mb-6">
          <p className="text-base text-[#1D1D1F] mb-3">(1)《隐私政策》中关于个人信息的收集和使用的说明。</p>
          <p className="text-base text-[#1D1D1F]">(2)《用户服务协议》中关于本应用使用条款的说明。</p>
        </div>
        <div className="mb-6">
          <p className="text-sm text-[#86868B] mb-2">用户协议和隐私政策说明：</p>
          <p className="text-sm text-[#424245]">
            阅读完整的
            <span
              onClick={onOpenAgreement}
              className="text-[#1D438A] hover:underline cursor-pointer font-medium"
            >
              《用户服务协议》
            </span>
            和
            <span
              onClick={onOpenPrivacy}
              className="text-[#1D438A] hover:underline cursor-pointer font-medium"
            >
              《隐私政策》
            </span>
            了解详细内容。
          </p>
        </div>
      </div>
      <div className="flex border-t border-gray-200">
        <button
          onClick={onDecline}
          className="flex-1 py-4 text-base font-medium text-[#1D1D1F] bg-white border-r border-gray-200 rounded-bl-[28px] hover:bg-gray-50 transition-colors"
        >
          不同意
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-4 text-base font-medium text-white bg-[#1D438A] hover:bg-[#1D438A]/90 rounded-br-[28px] transition-colors"
        >
          同意并继续
        </button>
      </div>
    </motion.div>
  </div>
);

const AgreementModal = ({ onClose, title, content }: { onClose: () => void, title: string, content: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-110">
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-[28px] w-full max-w-3xl h-[85vh] overflow-hidden shadow-2xl border border-black/5 flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-[#1D438A] rounded-xl flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <h2 className="text-xl font-bold text-[#1D1D1F]">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[#86868B] active:scale-90 transition-transform hover:bg-gray-200"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#F5F5F7] p-6">
        {content}
      </div>
    </motion.div>
  </div>
);

const DeclineModal = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-110">
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl border border-black/5 flex flex-col"
    >
      <div className="flex-1 p-6">
        <h2 className="text-xl font-bold text-[#1D1D1F] mb-4">确认拒绝</h2>
        <p className="text-gray-600 mb-6">您确定要拒绝用户协议和隐私政策吗？拒绝后将无法使用我们的服务。</p>
      </div>
      <div className="flex border-t border-black/5">
        <button
          onClick={onCancel}
          className="flex-1 py-4 text-center text-gray-600 font-medium hover:bg-gray-50"
        >
          取消
        </button>
        <div className="w-px bg-black/5"></div>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 text-center text-[#1D438A] font-medium hover:bg-gray-50"
        >
          确定
        </button>
      </div>
    </motion.div>
  </div>
);

const HomeView = ({ onNav }: { onNav: (v: ViewState) => void }) => (
  <div className="pb-24">
    <div className="px-6 pt-6">
      <h1 className="text-lg font-bold text-[#1D438A] text-center mb-6 tracking-widest uppercase">个人所得税计算器</h1>

      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 py-3 px-4 flex divide-x divide-gray-100 border border-gray-100">
        <div className="flex-1 text-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">起征标准</div>
          <div className="text-lg font-extrabold text-[#1D438A]">5000</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">汇算年度</div>
          <div className="text-lg font-extrabold text-[#1D438A]">2025/26</div>
        </div>
      </div>

      <SectionHeader title="快捷计算" />
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'monthly', icon: <FileText className="w-6 h-6" />, label: '工资薪金（按月）' },
          { id: 'annual', icon: <History className="w-6 h-6" />, label: '汇算清缴（按年）' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id as ViewState)}
            className="flex flex-col items-center justify-center p-4 bg-[#1D438A]/5 border border-[#1D438A]/10 rounded-2xl gap-3 hover:bg-[#1D438A]/10 transition-colors"
          >
            <div className="p-2 bg-[#1D438A] rounded-xl text-white">
              {item.icon}
            </div>
            <span className="text-xs font-bold text-[#1D438A]">{item.label}</span>
          </button>
        ))}
      </div>

      <SectionHeader title="2026 税率速查" />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="border border-gray-50 rounded-2xl overflow-hidden">
            <table className="w-full text-[10px]">
              <thead className="bg-[#1D438A] text-white">
                <tr>
                  <th className="py-2.5 px-1 text-center font-bold">级数</th>
                  <th className="py-2.5 px-2 text-left font-bold">全年应纳税所得额</th>
                  <th className="py-2.5 px-1 text-center font-bold">税率</th>
                  <th className="py-2.5 px-1 text-center font-bold">速扣</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { level: 1, range: '≤ 36,000', rate: '3%', quick: '0' },
                  { level: 2, range: '36,000 ~ 144,000', rate: '10%', quick: '2520' },
                  { level: 3, range: '144,000 ~ 300,000', rate: '20%', quick: '16920' },
                  { level: 4, range: '300,000 ~ 420,000', rate: '25%', quick: '31920' },
                  { level: 5, range: '420,000 ~ 660,000', rate: '30%', quick: '52920' },
                  { level: 6, range: '660,000 ~ 960,000', rate: '35%', quick: '85920' },
                  { level: 7, range: '> 960,000', rate: '45%', quick: '181920' },
                ].map((row) => (
                  <tr key={row.level} className="bg-white">
                    <td className="py-2.5 px-1 text-center text-gray-400 font-medium">{row.level}</td>
                    <td className="py-2.5 px-2 text-left text-gray-600 font-bold uppercase">{row.range}</td>
                    <td className="py-2.5 px-1 text-center font-black text-[#1D438A]">{row.rate}</td>
                    <td className="py-2.5 px-1 text-center text-gray-400 tabular-nums">{row.quick}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
             <div className="flex gap-2 items-start text-amber-600 mb-1.5">
               <Info className="w-3.5 h-3.5 mt-0.5" />
               <span className="text-[10px] font-black uppercase tracking-wider">使用说明</span>
             </div>
             <div className="space-y-1">
               <p className="text-[9px] font-bold text-amber-700/70 leading-relaxed">
                 1. 应纳税额 = 全年应纳税所得额 × 税率 - 速算扣除数
               </p>
               <p className="text-[9px] font-bold text-amber-700/70 leading-relaxed">
                 2. 全年应纳税所得额 = 年收入 - 60,000 - 五险一金 - 专项附加扣除
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
);

const MonthlyView = ({ onBack }: { onBack: () => void }) => {
  const [salary, setSalary] = useState('');
  const [insurance, setInsurance] = useState('');
  const [deductions, setDeductions] = useState('');
  const [result, setResult] = useState<TaxResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculate = () => {
    const s = parseFloat(salary) || 0;
    const i = parseFloat(insurance) || 0;
    const d = parseFloat(deductions) || 0;
    setResult(calculateTax({ salary: s, insurance: i, additionalDeductions: d }));
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <Header title="工资薪金（按月计算）" onBack={onBack} />
      <div className="px-6 py-4 pb-32">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-3.5 bg-[#1D438A] rounded-full" />
            <span className="text-[13px] font-extrabold text-[#1D438A]">在线试算</span>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-bold text-gray-400 mb-1 block uppercase tracking-wider">月税前收入 (元)</label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full border-b border-gray-100 py-1.5 text-base font-bold text-[#1D438A] focus:border-[#1D438A] transition-colors outline-none placeholder:text-gray-200"
                placeholder="请输入金额"
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-bold text-gray-400 mb-1 block uppercase tracking-wider">五险一金个人缴纳</label>
              <input
                type="number"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className="w-full border-b border-gray-100 py-1.5 text-base font-bold text-[#1D438A] focus:border-[#1D438A] transition-colors outline-none placeholder:text-gray-200"
                placeholder="请输入金额"
              />
            </div>
            <div className="group">
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">专项附加扣除</label>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-amber-500 hover:text-amber-600 transition-colors"
                >
                  <CircleHelp className="w-3 h-3" />
                </button>
              </div>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="w-full border-b border-gray-100 py-1.5 text-base font-bold text-[#1D438A] focus:border-[#1D438A] transition-colors outline-none placeholder:text-gray-200"
                placeholder="请输入金额"
              />
            </div>

            <button
              onClick={calculate}
              className="w-full py-3.5 bg-[#1D438A] text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-[#1D438A]/20 hover:bg-[#1D438A]/90 transition-all active:scale-[0.98] mt-2"
            >
              立刻计算
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-5 bg-blue-50/50 rounded-2xl text-center border border-blue-100/50"
              >
                <div className="text-[9px] font-black text-[#1D438A]/40 uppercase tracking-[0.2em] mb-1">预估累计应纳税额</div>
                <div className="text-xl font-black text-red-500">¥ {result.taxPayable.toLocaleString()}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-3.5 bg-[#1D438A] rounded-full" />
            <span className="text-[13px] font-extrabold text-[#1D438A]">政策简述</span>
          </div>
          <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
            每月 5000 元起征点，采用累计预扣法。
          </p>
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-red-400">
          温馨提示：计算结果仅供参考，具体以税局汇算为准。
        </p>
      </div>

      <DeductionInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

const AnnualView = ({ onBack }: { onBack: () => void }) => {
  const [inputs, setInputs] = useState({
    salary: '',
    bonus: '',
    insurance: '',
    additionalDeductions: ''
  });
  const [result, setResult] = useState<AnnualTaxResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculate = () => {
    const val: AnnualTaxInput = {
      salary: parseFloat(inputs.salary) || 0,
      bonus: parseFloat(inputs.bonus) || 0,
      insurance: parseFloat(inputs.insurance) || 0,
      additionalDeductions: parseFloat(inputs.additionalDeductions) || 0
    };
    setResult(calculateAnnualTax(val));
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <Header title="年度汇算清缴" onBack={onBack} />
      <div className="px-6 py-4 pb-32">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-3.5 bg-[#1D438A] rounded-full" />
            <span className="text-[13px] font-extrabold text-[#1D438A]">年度综合所得汇算</span>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-full w-max">
              <span className="text-xs">💰</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">收入详情 (年)</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {[
                { key: 'salary', label: '工资薪金 (月均额)', hint: '请输入金额' },
                { key: 'bonus', label: '全年一次性奖金', hint: '请输入金额' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="text-[10px] font-bold text-gray-400 mb-1 block">{item.label}</label>
                  <input
                    type="number"
                    value={inputs[item.key as keyof typeof inputs]}
                    onChange={(e) => setInputs({ ...inputs, [item.key]: e.target.value })}
                    className="w-full border-b border-gray-50 py-1 text-sm font-bold text-[#1D438A] focus:border-[#1D438A] transition-colors outline-none placeholder:text-gray-200"
                    placeholder={item.hint}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-full w-max mt-4">
              <span className="text-xs">📉</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">预扣除项 (年)</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 mb-1 block">五险一金个人缴纳</label>
                <input
                  type="number"
                  value={inputs.insurance}
                  onChange={(e) => setInputs({ ...inputs, insurance: e.target.value })}
                  className="w-full border-b border-gray-50 py-1 text-sm font-bold text-[#1D438A] focus:border-[#1D438A] transition-colors outline-none placeholder:text-gray-200"
                  placeholder="年度合计金额"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-[10px] font-bold text-gray-400 block">专项附加扣除合计</label>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    <CircleHelp className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="number"
                  value={inputs.additionalDeductions}
                  onChange={(e) => setInputs({ ...inputs, additionalDeductions: e.target.value })}
                  className="w-full border-b border-gray-50 py-1 text-sm font-bold text-[#1D438A] focus:border-[#1D438A] transition-colors outline-none placeholder:text-gray-200"
                  placeholder="年度合计金额"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full py-3.5 bg-[#1D438A] text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-[#1D438A]/20 hover:bg-[#1D438A]/90 transition-all active:scale-[0.98] mt-2"
            >
              立刻计算
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-[9px] font-black text-[#1D438A]/40 uppercase tracking-wider">综合所得总收入</div>
                    <div className="text-base font-black text-[#1D438A] mt-1">¥ {result.totalComprehensiveIncome.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-black text-[#1D438A]/40 uppercase tracking-wider">应纳税所得额</div>
                    <div className="text-base font-black text-[#1D438A] mt-1">¥ {result.taxableComprehensiveIncome.toLocaleString()}</div>
                  </div>
                  <div className="col-span-2 text-center border-t border-blue-100/50 pt-4 mt-2">
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-wider">预估年度总税额</div>
                    <div className="text-2xl font-black text-red-500">¥ {result.totalTax.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-[9px] font-black text-[#1D438A]/40 uppercase tracking-wider">平均税负率</div>
                  <div className="text-lg font-black text-[#1D438A]">{result.averageRate}%</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-3.5 bg-[#1D438A] rounded-full" />
            <span className="text-[13px] font-extrabold text-[#1D438A]">政策简述</span>
          </div>
          <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
            年度汇算清缴是居民个人将一个纳税年度内取得的综合所得合并后，按年计算全年最终应缴纳的个税。
          </p>
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-red-400">
          温馨提示：计算结果仅供参考，具体以税局汇算为准。
        </p>
      </div>

      <DeductionInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

const ProfileView = ({ onBack }: { onBack: () => void }) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <Header title="关于" onBack={onBack} />
      <div className="px-6 py-4 pb-32">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-[#1D438A] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#1D438A]/20">
              <span className="text-3xl">🧮</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">飞序个税助手</h2>
            <p className="text-sm text-gray-400 mt-1">版本 1.0.0</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              可按月/按年一键计算个税，简单又方便！
            </p>

            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="w-full py-3 px-4 bg-gray-50 rounded-xl text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">查看隐私政策</span>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3.5 bg-[#1D438A] rounded-full" />
            <span className="text-[13px] font-extrabold text-[#1D438A]">隐私保护</span>
          </div>
          <p className="text-[13px] font-medium text-gray-600 leading-relaxed">
            本应用为本地化计算工具，所有数据仅在您的设备本地进行处理，不会上传至任何服务器或第三方机构，充分保护您的隐私安全。
          </p>
        </div>

        <p className="mt-8 text-center text-[11px] font-medium text-gray-400">
          © 2026 光年跃迁（温州）科技有限公司
        </p>
      </div>

      <GenericModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="隐私政策"
        content={`
# 🔒 隐私政策

**生效日期**：2026年05月06日

欢迎使用「飞序个税助手」（以下简称"本应用"）。本应用由**光年跃迁（温州）科技有限公司**（以下简称"我们"）开发并运营。我们深知个人信息对您的重要性，将严格遵守《中华人民共和国个人信息保护法》等相关法律法规，保护您的个人信息安全。

本隐私政策旨在说明我们如何收集、使用、存储和保护您在使用本应用过程中提供的个人信息，以及您对这些信息所享有的权利。请您在使用本应用前仔细阅读并充分理解本政策的全部内容，尤其是加粗的条款。如您对本政策有任何疑问、意见或建议，可通过本政策末尾提供的联系方式与我们联系。

## 一、我们收集的信息

本应用是一款**本地化个人所得税计算工具**。您输入的工资、奖金、五险一金及专项附加扣除等所有税务相关数据，**均仅在您本地浏览器中进行即时计算，我们不会将这些信息上传至任何服务器或第三方机构**。

在您使用本应用的过程中，我们不会收集任何能够识别您个人身份的信息，包括但不限于：

1. **本地计算**：您输入的月税前收入、五险一金、专项附加扣除等数据，仅在您的设备本地进行计算处理。

2. **不存储数据**：本应用不保存您的任何计算记录或财务数据，关闭页面后所有数据将自动清除。

3. **设备信息**：为保障应用基本运行，我们仅收集必要的设备信息用于界面适配，不包含任何可追踪您身份的信息。

## 二、我们如何使用收集的信息

由于本应用不收集您的个人财务数据，我们仅使用必要的设备信息用于：

1. **界面适配**：根据您的设备屏幕尺寸，提供合适的界面布局。

2. **应用稳定**：确保应用在各设备上能够正常运行。

## 三、我们如何共享、转让和公开披露信息

由于本应用不收集您的任何个人信息，因此不存在向第三方共享、转让或公开披露信息的情形。

## 四、我们如何存储和保护信息

1. **数据存储**：本应用不存储您的任何个人数据。所有计算均在本地即时完成，关闭页面后数据自动清除。

2. **安全措施**：由于数据不经过服务器传输，您的财务信息始终保存在您的本地设备上，安全可靠。

## 五、您的权利

根据相关法律法规，您对您的个人信息享有以下权利：

1. **数据控制权**：本应用不存储您的任何数据，所有数据仅存在于当前会话中，您关闭页面即可彻底销毁。

2. **无痕使用**：您可以随时关闭页面清除所有数据，我们无法获取您的任何信息。

## 六、未成年人保护

我们非常重视对未成年人个人信息的保护。如您是未满14周岁的未成年人，在使用本应用前，应在监护人的指导下仔细阅读本政策。如我们发现自己在未事先获得监护人可验证同意的情况下收集了未成年人的个人信息，将立即删除相关数据。

## 七、本政策的更新

我们可能会根据法律法规的更新、业务的调整或技术的发展，适时对本隐私政策进行修订。修订后的政策将在本应用内显著位置公示，并在生效前通过合理方式通知您。如您继续使用本应用，即表示您同意接受修订后的政策。

## 八、联系我们

如您对本隐私政策有任何疑问、意见或建议，或需要行使您的相关权利，请通过以下方式与我们联系：

**电子邮箱**：Jp112022@163.com

---

感谢您使用飞序个税助手！

我们致力于为您提供安全、便捷的个人所得税计算服务。

© 2026 光年跃迁（温州）科技有限公司 版权所有
`}
      />
    </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [currentContent, setCurrentContent] = useState<React.ReactNode>(null);
  const [currentTitle, setCurrentTitle] = useState('');

  useEffect(() => {
    const accepted = localStorage.getItem('privacy_accepted');
    if (accepted === 'true') {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy_accepted', 'true');
    setHasAccepted(true);
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = () => {
    window.location.reload();
  };

  const handleDeclineCancel = () => {
    setShowDeclineModal(false);
  };

  const handleOpenAgreement = () => {
    setCurrentTitle('用户服务协议');
    setCurrentContent(<UserAgreementContent />);
    setShowAgreementModal(true);
  };

  const handleOpenPrivacy = () => {
    setCurrentTitle('隐私政策');
    setCurrentContent(<PrivacyPolicyContent />);
    setShowPrivacyModal(true);
  };

  const handleCloseModal = () => {
    setShowAgreementModal(false);
    setShowPrivacyModal(false);
  };

  if (!hasAccepted) {
    return (
      <>
        <PrivacyModal
          onAccept={handleAccept}
          onDecline={handleDecline}
          onOpenAgreement={handleOpenAgreement}
          onOpenPrivacy={handleOpenPrivacy}
        />
        <AnimatePresence>
          {showDeclineModal && (
            <DeclineModal onCancel={handleDeclineCancel} onConfirm={handleDeclineConfirm} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showAgreementModal && (
            <AgreementModal onClose={handleCloseModal} title={currentTitle} content={currentContent} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showPrivacyModal && (
            <AgreementModal onClose={handleCloseModal} title={currentTitle} content={currentContent} />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AnimatePresence mode="wait">
        {activeView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeView onNav={setActiveView} />
          </motion.div>
        )}
        {activeView === 'monthly' && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MonthlyView onBack={() => setActiveView('home')} />
          </motion.div>
        )}
        {activeView === 'annual' && (
          <motion.div
            key="annual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AnnualView onBack={() => setActiveView('home')} />
          </motion.div>
        )}
        {activeView === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ProfileView onBack={() => setActiveView('home')} />
          </motion.div>
        )}
      </AnimatePresence>
      <NavBar activeView={activeView} setView={setActiveView} />
    </div>
  );
}
