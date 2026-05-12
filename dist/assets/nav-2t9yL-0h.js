var e=`truve_google_auth_session_v1`,t=[`admin@truve.foundation`,`operator@truve.foundation`];function n(){let e={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_GOOGLE_CLIENT_ID:`48818789119-00a6u08lur3n9g0d01b80107oeuehsfc.apps.googleusercontent.com`,VITE_OPERATOR_EMAILS:`sangjpyo@gmail.com`};return(e?.VITE_OPERATOR_EMAILS??e?.VITE_ADMIN_EMAILS??``).split(`,`).map(e=>e.trim().toLowerCase()).filter(Boolean)}function r(e){let r=e.trim().toLowerCase();return[...t,...n()].includes(r)?`operator`:`user`}function i(){try{let t=window.localStorage.getItem(e);if(!t)return null;let n=JSON.parse(t);return!n.email||!n.name?null:{provider:`google`,role:n.role??r(n.email),email:n.email,name:n.name,picture:n.picture,sub:n.sub,issuedAt:n.issuedAt??new Date().toISOString(),demo:n.demo}}catch{return null}}function a(t){window.localStorage.setItem(e,JSON.stringify(t))}function o(){window.localStorage.removeItem(e)}function s(e=i()){return e?.role===`operator`}function c(e){return e?e.name||e.email||`Google 계정`:`로그인`}function l(e){let t=e.split(`.`)[1];if(!t)return{};let n=t.replace(/-/g,`+`).replace(/_/g,`/`),r=decodeURIComponent(Array.from(window.atob(n)).map(e=>`%${e.charCodeAt(0).toString(16).padStart(2,`0`)}`).join(``)),i=JSON.parse(r);return{email:i.email??``,name:i.name??i.email??`Google User`,picture:i.picture,sub:i.sub}}function u(){return{provider:`google`,role:`user`,email:`demo@truve.foundation`,name:`Truve Demo User`,issuedAt:new Date().toISOString(),demo:!0}}function d(){return{provider:`google`,role:`operator`,email:`operator@truve.foundation`,name:`Truve Operator`,issuedAt:new Date().toISOString(),demo:!0}}var f=[{id:`foundations`,label:`기부하기`,href:`./foundations.html`},{id:`foundation-info`,label:`기부재단 소개`,href:`./foundation-info.html`},{id:`status`,label:`내 기부 현황`,href:`./status.html`},{id:`community`,label:`커뮤니티`,href:`./community.html`},{id:`about`,label:`서비스 소개`,href:`./about.html`},{id:`admin`,label:`Admin`,href:`./admin.html`}];function p(e){let t=i();return`
    <header class="app-header glass-nav">
      <a class="brand-lockup" href="./foundations.html" aria-label="Truve home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <path class="logo-layer logo-layer-top" d="M16 7 6 12.2 16 17.4 26 12.2 16 7Z"></path>
            <path class="logo-layer logo-layer-mid" d="M7.5 17.4 16 21.8 24.5 17.4"></path>
            <path class="logo-layer logo-layer-bottom" d="M8.5 22 16 25.8 23.5 22"></path>
          </svg>
        </span>
        <span class="brand">Truve</span>
      </a>
      <p class="sub-copy">XRPL Donation Credential infrastructure</p>
      <nav class="tab-nav" aria-label="Main Navigation">
        ${f.filter(e=>e.id!==`admin`||s()).map(t=>`<a class="${t.id===e?`tab-link is-active`:`tab-link`}" href="${t.href}">${t.label}</a>`).join(``)}
        <a class="${e===`auth`||e===`account`?`tab-link auth-nav-link is-active`:`tab-link auth-nav-link`}" href="${t?`./status.html#account-card`:`./auth.html`}">${t?`내 정보`:`로그인`}</a>
      </nav>
    </header>
  `}export{l as a,r as c,d as i,c as l,o as n,i as o,u as r,s,p as t,a as u};