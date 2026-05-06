import React, { useState } from 'react';
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
} from 'lucide-react';
import { calculateTax, calculateAnnualTax } from './utils/taxCalc';
import { TaxResult, AnnualTaxResult, AnnualTaxInput } from './types';
import { TAX_BRACKETS, ANNUAL_TAX_BRACKETS } from './constants';

// --- Types ---
type ViewState = 'home' | 'monthly' | 'annual' | 'profile';

// --- Components ---

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

const PRIVACY_CONTENT = `
# 隐私政策

**最后更新日期：2026年5月2日**

个税助手（以下简称“我们”）非常重视用户（以下简称“您”）的隐私保护。本政策旨在说明我们如何处理您的信息。

## 1. 信息收集与使用
本应用是一款**本地化计算工具**。您输入的工资、奖金、五险一金及专项附加扣除等所有税务相关数据，**均仅在您本地浏览器中进行即时计算，我们不会将这些信息上传至任何服务器或第三方机构**。

## 2. 数据存储
我们不存储您的任何敏感财务数据。计算记录仅存在于当前会话中。

## 3. 第三方插件
本应用不包含任何用于追踪、分析或广告投放的第三方SDK。

## 4. 您的权利
您可以通过清空浏览器缓存或关闭页面来彻底销毁本次计算的数据。

## 5. 联系我们
如有任何关于隐私的疑问，请通过官方支持渠道与我们取得联系。
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

// --- Sub-Views ---

const HomeView = ({ onNav }: { onNav: (v: ViewState) => void }) => (
  <div className="pb-24">
    <div className="px-6 pt-6">
      <h1 className="text-lg font-bold text-[#1D438A] text-center mb-6 tracking-widest uppercase">个人所得税计算器</h1>
      
      {/* Overview Card */}
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
                  placeholder="年度总额"
                />
              </div>
            </div>

            <button 
              onClick={calculate}
              className="w-full py-3.5 bg-[#1D438A] text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-[#1D438A]/20 hover:bg-[#1D438A]/90 transition-all active:scale-[0.98] mt-2"
            >
              开始汇算
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 bg-[#1D438A]/5 rounded-3xl border border-[#1D438A]/10"
              >
                <div className="text-center text-[9px] font-black text-[#1D438A]/30 uppercase tracking-[0.2em] mb-4">汇算清缴结果估算</div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-gray-400">综合所得总收入</span>
                     <span className="text-sm font-black text-[#1D438A]">¥ {result.totalComprehensiveIncome.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-gray-400">应纳税所得额</span>
                     <span className="text-sm font-black text-[#1D438A]">¥ {result.taxableComprehensiveIncome.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                     <span className="text-[11px] font-bold text-red-500">预估年度总税额</span>
                     <span className="text-lg font-black text-red-500">¥ {result.totalTax.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-gray-400">平均税负率</span>
                     <span className="text-xs font-black text-gray-500">{result.averageRate}%</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-red-400">
          温馨提示：计算结果仅供参考，具体以税局汇算为准。
        </p>
      </div>

      <DeductionInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

// --- Main App ---

const ProfileView = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="pb-24 bg-gray-50/50 min-h-screen font-sans">
      <Header title="关于我们" />
      
      <div className="px-6 pt-6">
        {/* App Info Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col items-center text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1D438A]" />
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#1D438A]" />
          <div className="w-16 h-16 bg-[#1D438A]/5 rounded-2xl flex items-center justify-center border border-[#1D438A]/10 mb-4">
            <Info className="w-8 h-8 text-[#1D438A]" />
          </div>
          <h3 className="text-xl font-black text-[#1D438A] mb-1">飞序个税助手</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">可按月/按年一键计算个税，简单又方便！</p>
        </div>

        <SectionHeader title="服务说明" />
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
          {[
            { icon: <User className="w-4 h-4" />, label: '隐私政策', hint: '保护您的数据', action: () => setShowPrivacy(true) },
            { icon: <History className="w-4 h-4" />, label: '版本信息', right: 'V1.0' },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className={`w-full py-5 px-6 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#1D438A]/60">
                  {item.icon}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-black text-gray-800">{item.label}</span>
                  {item.hint && <span className="text-[10px] font-bold text-gray-400">{item.hint}</span>}
                </div>
              </div>
              {item.right ? (
                <div className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black text-gray-400 uppercase">
                  {item.right}
                </div>
              ) : (
                <ArrowLeft className="w-3.5 h-3.5 text-gray-300 rotate-180" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block px-4 py-1.5 bg-[#1D438A]/5 rounded-full border border-[#1D438A]/10 mb-4">
            <p className="text-[10px] font-black text-[#1D438A] uppercase tracking-[0.2em]">
              专业个税计算器
            </p>
          </div>
          <p className="text-[8px] font-medium text-gray-200 mt-4 max-w-[180px] mx-auto leading-relaxed">
            本程序仅为计算工具，不作为最终纳税凭证。
          </p>
        </div>
      </div>
      
      <GenericModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        title="隐私政策" 
        content={PRIVACY_CONTENT} 
      />
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('home');

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans antialiased overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <HomeView onNav={setView} />
          </motion.div>
        )}
        {view === 'monthly' && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MonthlyView onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'annual' && (
          <motion.div
            key="annual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AnnualView onBack={() => setView('home')} />
          </motion.div>
        )}
        {view === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileView />
          </motion.div>
        )}
      </AnimatePresence>
      
      <NavBar activeView={view} setView={setView} />
    </div>
  );
}
