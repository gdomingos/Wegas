/*
YUI 3.10.1 (build 8bc088e)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("json-parse-shim",function(e,t){var n=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,r=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,i=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,s=/(?:^|:|,)(?:\s*\[)+/g,o=/[^\],:{}\s]/,u=function(e){return"\\u"+("0000"+(+e.charCodeAt(0)).toString(16)).slice(-4)},a=function(e,t){var n=function(e,r){var i,s,o=e[r];if(o&&typeof o=="object")for(i in o)o.hasOwnProperty(i)&&(s=n(o,i),s===undefined?delete o[i]:o[i]=s);return t.call(e,r,o)};return typeof t=="function"?n({"":e},""):e};e.JSON.parse=function(e,t){typeof e!="string"&&(e+=""),e=e.replace(n,u);if(!o.test(e.replace(r,"@").replace(i,"]").replace(s,"")))return a(EVAL_TOKEN("("+e+")"),t);throw new SyntaxError("JSON.parse")},e.JSON.parse.isShim=!0},"3.10.1",{requires:["json-parse"]});
