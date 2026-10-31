/**
 * 利用規約・注意事項ポップアップ
 * フッターの文字をクリックすると <dialog> で表示する
 */
(() => {
  const dialog = document.getElementById('termsDialog');
  const openBtn = document.getElementById('termsOpenBtn');
  const closeBtn = document.getElementById('termsCloseBtn');

  openBtn.addEventListener('click', () => dialog.showModal());
  closeBtn.addEventListener('click', () => dialog.close());

  // 背景（ポップアップの外側）をクリックしても閉じる
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
})();
