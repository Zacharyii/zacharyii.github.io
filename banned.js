// banned.js   （放在仓库根目录或 assets/ 目录均可）
(() => {
  // ---------- 1. 基础违禁词 ----------
  const BASE_BANNED = [
    // 项目赚钱
    "0成本","0撸","chainless","高利期","高收益回报","日赚","上车红利","无链","副业",
    "项目","零撸",

    // 银行
    "农业银行","渤海银行","广发银行","工商银行","建设银行","恒丰银行","华夏银行","交通银行",
    "银行","民生银行","浦发银行","平安银行","兴业银行","招商银行","央行","中信银行",
    "中国光大银行","中国邮政储蓄银行","浙商银行",

    // 投资
    "保底收益","众筹","投资回报","快速回报","升值","收益率","无风险",

    // 联系方式
    "QQ","QQ群","qq","V","VV","VX","vx","钉钉","钉钉群号","电报","推广",
    "TG","TG群","tg","tg群","WXN","微信","微信群","微博","邀请码","邀请好友",
    "扫码","二维码","联系方式","推荐码","球球","导师","链接","http","https",

    // 钱包
    "imtoken","imkey","imgf","im钱包","token","钱包","IMTOKEN","IMToken","Token",

    // 项目名
    "76640050675","1602018606","iwff1788","VV币","中本聪oex空投","公主号","沃克短视频",
    "英国项目GEE","国外短视频gee","PiNetwork","PINetwork","PI网络",

    // 交易策略
    "KDJ","MACD","交易","趋势","策略","策略群","布林带","回调",
    "反弹","支撑","止损","分析","进场","杠杆","走势","出局","震荡","盘",
    "企稳","破位","回撤","追空","逆势","点位","锁单","实盘策略","策略跟单",
    "实盘上车","实时指导","实盘指导",

    // 其他
    "出U","出u","出油","收U","收u","收油","返佣","交易所","免费挖","百倍币",
    "空投","首码","合约带单","带单师","指导师","指导老师","VIP","直营",
    "张政委","石盘","磐面","哆","箜"
  ];

  // ---------- 2. 生成变体 ----------
  function generateVariants(word) {
    const variants = new Set([word]);

    // 插入空格（1~3个）
    for (let i = 1; i < word.length; i++) {
      variants.add(word.slice(0, i) + ' ' + word.slice(i));
      variants.add(word.slice(0, i) + '  ' + word.slice(i));
      variants.add(word.slice(0, i) + '   ' + word.slice(i));
    }

    // 插入 . - _ 、 ， 。
    ['.', '-', '_', '。', '，', '、'].forEach(sep => {
      for (let i = 1; i < word.length; i++) {
        variants.add(word.slice(0, i) + sep + word.slice(i));
      }
    });

    // 大小写
    if (/[a-zA-Z]/.test(word)) {
      const upper = word.toUpperCase();
      const lower = word.toLowerCase();
      if (upper !== word) variants.add(upper);
      if (lower !== word) variants.add(lower);
    }

    // 短词重复尾字母（如 V→VVX）
    if (word.length <= 3) {
      variants.add(word + word.slice(-1));
    }

    // 零宽字符
    variants.add(word.split('').join('\u200B'));
    variants.add(word.split('').join('\u2060'));

    return Array.from(variants);
  }

  // ---------- 3. 编译正则 ----------
  const ALL_PATTERNS = [];
  let TOTAL_VARIANTS = 0;

  BASE_BANNED.forEach(base => {
    const vars = generateVariants(base);
    TOTAL_VARIANTS += vars.length;
    vars.forEach(v => {
      try {
        const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        ALL_PATTERNS.push(new RegExp(escaped, 'gi'));
      } catch (e) {
        console.warn('正则生成失败:', v);
      }
    });
  });

  // ---------- 4. 暴露给全局 ----------
  // 这样 index.html 只需要 `window.checkBanned(msg, callback)`
  window.checkBanned = (msg, callback) => {
    const lower = msg.toLowerCase();
    const found = new Set();

    ALL_PATTERNS.forEach(p => {
      const matches = lower.matchAll(p);
      for (const m of matches) {
        const clean = m[0].replace(/\s+/g, ' ')
                         .replace(/[\u200B\u2060]/g, '')
                         .trim();
        if (clean) found.add(clean);
      }
    });

    const list = Array.from(found).sort();
    callback({
      totalPatterns: ALL_PATTERNS.length,
      totalVariants: TOTAL_VARIANTS,
      found: list
    });
  };

  // 页面加载完后显示统计
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('stats');
    if (el) el.textContent = `已加载 ${ALL_PATTERNS.length} 条防绕过规则（约 ${TOTAL_VARIANTS} 变体）`;
  });
})();