(()=>{
  const STORAGE_KEY='ielts-pabs-theme';
  const root=document.documentElement;
  let initialTheme='dark';

  try{
    if(localStorage.getItem(STORAGE_KEY)==='light')initialTheme='light';
  }catch(error){}

  root.dataset.theme=initialTheme;

  function mountThemeToggle(){
    const authActions=document.querySelector('.auth-actions');
    if(!authActions||authActions.querySelector('.theme-toggle'))return;

    const button=document.createElement('button');
    button.type='button';
    button.className='theme-toggle';
    button.innerHTML=`
      <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.4"></circle>
        <path d="M12 2.6v2.2M12 19.2v2.2M4.1 4.1l1.6 1.6M18.3 18.3l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.1 19.9l1.6-1.6M18.3 5.7l1.6-1.6"></path>
      </svg>
      <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.7 15.2A7.8 7.8 0 0 1 8.8 4.3 8.2 8.2 0 1 0 19.7 15.2Z"></path>
      </svg>`;

    function applyTheme(theme,{persist=false}={}){
      const next=theme==='light'?'light':'dark';
      root.dataset.theme=next;
      const lightActive=next==='light';
      button.setAttribute('aria-pressed',String(lightActive));
      button.setAttribute('aria-label',lightActive?'Use dark theme':'Use light theme');
      button.title=lightActive?'Use dark theme':'Use light theme';
      if(persist){
        try{localStorage.setItem(STORAGE_KEY,next)}catch(error){}
      }
    }

    authActions.insertBefore(button,authActions.firstChild);
    applyTheme(root.dataset.theme);
    button.addEventListener('click',()=>applyTheme(root.dataset.theme==='light'?'dark':'light',{persist:true}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountThemeToggle,{once:true});
  else mountThemeToggle();
})();
