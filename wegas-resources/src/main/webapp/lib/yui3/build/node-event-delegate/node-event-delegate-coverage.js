/*
YUI 3.10.3 (build 2fb5187)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

if (typeof __coverage__ === 'undefined') { __coverage__ = {}; }
if (!__coverage__['build/node-event-delegate/node-event-delegate.js']) {
   __coverage__['build/node-event-delegate/node-event-delegate.js'] = {"path":"build/node-event-delegate/node-event-delegate.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0},"b":{"1":[0,0],"2":[0,0]},"f":{"1":0,"2":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":31},"end":{"line":1,"column":50}}},"2":{"name":"(anonymous_2)","line":43,"loc":{"start":{"line":43,"column":28},"end":{"line":43,"column":43}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":54,"column":60}},"2":{"start":{"line":43,"column":0},"end":{"line":51,"column":2}},"3":{"start":{"line":45,"column":4},"end":{"line":46,"column":73}},"4":{"start":{"line":48,"column":4},"end":{"line":48,"column":38}},"5":{"start":{"line":50,"column":4},"end":{"line":50,"column":37}}},"branchMap":{"1":{"line":46,"type":"cond-expr","locations":[{"start":{"line":46,"column":67},"end":{"line":46,"column":68}},{"start":{"line":46,"column":71},"end":{"line":46,"column":72}}]},"2":{"line":46,"type":"binary-expr","locations":[{"start":{"line":46,"column":17},"end":{"line":46,"column":38}},{"start":{"line":46,"column":42},"end":{"line":46,"column":63}}]}},"code":["(function () { YUI.add('node-event-delegate', function (Y, NAME) {","","/**"," * Functionality to make the node a delegated event container"," * @module node"," * @submodule node-event-delegate"," */","","/**"," * <p>Sets up a delegation listener for an event occurring inside the Node."," * The delegated event will be verified against a supplied selector or"," * filtering function to test if the event references at least one node that"," * should trigger the subscription callback.</p>"," *"," * <p>Selector string filters will trigger the callback if the event originated"," * from a node that matches it or is contained in a node that matches it."," * Function filters are called for each Node up the parent axis to the"," * subscribing container node, and receive at each level the Node and the event"," * object.  The function should return true (or a truthy value) if that Node"," * should trigger the subscription callback.  Note, it is possible for filters"," * to match multiple Nodes for a single event.  In this case, the delegate"," * callback will be executed for each matching Node.</p>"," *"," * <p>For each matching Node, the callback will be executed with its 'this'"," * object set to the Node matched by the filter (unless a specific context was"," * provided during subscription), and the provided event's"," * <code>currentTarget</code> will also be set to the matching Node.  The"," * containing Node from which the subscription was originally made can be"," * referenced as <code>e.container</code>."," *"," * @method delegate"," * @param type {String} the event type to delegate"," * @param fn {Function} the callback function to execute.  This function"," *              will be provided the event object for the delegated event."," * @param spec {String|Function} a selector that must match the target of the"," *              event or a function to test target and its parents for a match"," * @param context {Object} optional argument that specifies what 'this' refers to."," * @param args* {any} 0..n additional arguments to pass on to the callback function."," *              These arguments will be added after the event object."," * @return {EventHandle} the detach handle"," * @for Node"," */","Y.Node.prototype.delegate = function(type) {","","    var args = Y.Array(arguments, 0, true),","        index = (Y.Lang.isObject(type) && !Y.Lang.isArray(type)) ? 1 : 2;","","    args.splice(index, 0, this._node);","","    return Y.delegate.apply(Y, args);","};","","","}, '3.10.3', {\"requires\": [\"node-base\", \"event-delegate\"]});","","}());"]};
}
var __cov_Eet$aokz9U_hlV64oM3TXQ = __coverage__['build/node-event-delegate/node-event-delegate.js'];
__cov_Eet$aokz9U_hlV64oM3TXQ.s['1']++;YUI.add('node-event-delegate',function(Y,NAME){__cov_Eet$aokz9U_hlV64oM3TXQ.f['1']++;__cov_Eet$aokz9U_hlV64oM3TXQ.s['2']++;Y.Node.prototype.delegate=function(type){__cov_Eet$aokz9U_hlV64oM3TXQ.f['2']++;__cov_Eet$aokz9U_hlV64oM3TXQ.s['3']++;var args=Y.Array(arguments,0,true),index=(__cov_Eet$aokz9U_hlV64oM3TXQ.b['2'][0]++,Y.Lang.isObject(type))&&(__cov_Eet$aokz9U_hlV64oM3TXQ.b['2'][1]++,!Y.Lang.isArray(type))?(__cov_Eet$aokz9U_hlV64oM3TXQ.b['1'][0]++,1):(__cov_Eet$aokz9U_hlV64oM3TXQ.b['1'][1]++,2);__cov_Eet$aokz9U_hlV64oM3TXQ.s['4']++;args.splice(index,0,this._node);__cov_Eet$aokz9U_hlV64oM3TXQ.s['5']++;return Y.delegate.apply(Y,args);};},'3.10.3',{'requires':['node-base','event-delegate']});
