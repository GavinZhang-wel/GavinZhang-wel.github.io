// scripts/skills.js
// 平滑滚动到 :target 的元素并设置焦点，提升无障碍体验
(function () {
  function scrollToHash() {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      // 稍作延迟以等待 :target 样式生效
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          el.focus({ preventScroll: true });
        } catch (e) {
          // older browsers may not support options
          el.setAttribute('tabindex', '-1');
          el.focus();
        }
      }, 50);
    }
  }

  // 页面加载或 hash 变化时触发
  window.addEventListener('load', scrollToHash);
  window.addEventListener('hashchange', scrollToHash);
})();
