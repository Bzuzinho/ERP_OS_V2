import{r as n,R as f,j as e,x as r}from"./app-CIoQXlZ6.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var u={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),c=(s,a)=>{const o=n.forwardRef(({color:x="currentColor",size:t=24,strokeWidth:l=2,absoluteStrokeWidth:d,className:m="",children:i,...h},p)=>n.createElement("svg",{ref:p,...u,width:t,height:t,stroke:x,strokeWidth:d?Number(l)*24/Number(t):l,className:["lucide",`lucide-${N(s)}`,m].join(" "),...h},[...a.map(([y,j])=>n.createElement(y,j)),...Array.isArray(i)?i:[i]]));return o.displayName=`${s}`,o};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=c("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=c("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function g(){const[s,a]=f.useState(!1);return e.jsx("nav",{className:"bg-primary-600 text-white",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"flex justify-between items-center h-16",children:[e.jsxs(r,{href:"/",className:"flex items-center space-x-2",children:[e.jsx("span",{className:"text-2xl",children:"🏛️"}),e.jsx("span",{className:"font-bold text-lg hidden sm:inline",children:"Junta Operacional"})]}),e.jsxs("div",{className:"hidden md:flex space-x-8",children:[e.jsx(r,{href:"/",className:"hover:text-primary-100 transition-colors",children:"Dashboard"}),e.jsx(r,{href:"/tarefas",className:"hover:text-primary-100 transition-colors",children:"Tarefas"}),e.jsx(r,{href:"/pedidos",className:"hover:text-primary-100 transition-colors",children:"Pedidos"}),e.jsx(r,{href:"/settings",className:"hover:text-primary-100 transition-colors",children:"Configurações"})]}),e.jsx("button",{onClick:()=>a(!s),className:"md:hidden",children:s?e.jsx(v,{size:24}):e.jsx(b,{size:24})})]}),s&&e.jsxs("div",{className:"md:hidden pb-4 space-y-2",children:[e.jsx(r,{href:"/",className:"block hover:text-primary-100 transition-colors",children:"Dashboard"}),e.jsx(r,{href:"/tarefas",className:"block hover:text-primary-100 transition-colors",children:"Tarefas"}),e.jsx(r,{href:"/pedidos",className:"block hover:text-primary-100 transition-colors",children:"Pedidos"}),e.jsx(r,{href:"/settings",className:"block hover:text-primary-100 transition-colors",children:"Configurações"})]})]})})}function w({children:s}){return e.jsxs("div",{className:"min-h-screen bg-gray-50",children:[e.jsx(g,{}),e.jsx("main",{className:"py-4",children:s}),e.jsx("footer",{className:"bg-white border-t border-gray-200 py-6 mt-12",children:e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600",children:e.jsx("p",{children:"© 2024 Junta Operacional. Todos os direitos reservados."})})})]})}export{w as M};
