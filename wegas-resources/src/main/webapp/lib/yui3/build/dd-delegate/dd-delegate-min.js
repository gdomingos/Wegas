/*
YUI 3.10.1 (build 8bc088e)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("dd-delegate",function(e,t){var n=function(){n.superclass.constructor.apply(this,arguments)},r="container",i="nodes",s=e.Node.create("<div>Temp Node</div>");e.extend(n,e.Base,{_bubbleTargets:e.DD.DDM,dd:null,_shimState:null,_handles:null,_onNodeChange:function(e){this.set("dragNode",e.newVal)},_afterDragEnd:function(){e.DD.DDM._noShim=this._shimState,this.set("lastNode",this.dd.get("node")),this.get("lastNode").removeClass(e.DD.DDM.CSS_PREFIX+"-dragging"),this.dd._unprep(),this.dd.set("node",s)},_delMouseDown:function(t){var n=t.currentTarget,r=this.dd,s=n,o=this.get("dragConfig");n.test(this.get(i))&&!n.test(this.get("invalid"))&&(this._shimState=e.DD.DDM._noShim,e.DD.DDM._noShim=!0,this.set("currentNode",n),r.set("node",n),o&&o.dragNode?s=o.dragNode:r.proxy&&(s=e.DD.DDM._proxy),r.set("dragNode",s),r._prep(),r.fire("drag:mouseDown",{ev:t}))},_onMouseEnter:function(){this._shimState=e.DD.DDM._noShim,e.DD.DDM._noShim=!0},_onMouseLeave:function(){e.DD.DDM._noShim=this._shimState},initializer:function(){this._handles=[];var t=this.get("dragConfig")||{},n=this.get(r);t.node=s.cloneNode(!0),t.bubbleTargets=this,this.get("handles")&&(t.handles=this.get("handles")),this.dd=new e.DD.Drag(t),this.dd.after("drag:end",e.bind(this._afterDragEnd,this)),this.dd.on("dragNodeChange",e.bind(this._onNodeChange,this)),this.dd.after("drag:mouseup",function(){this._unprep()}),this._handles.push(e.delegate(e.DD.Drag.START_EVENT,e.bind(this._delMouseDown,this),n,this.get(i))),this._handles.push(e.on("mouseenter",e.bind(this._onMouseEnter,this),n)),this._handles.push(e.on("mouseleave",e.bind(this._onMouseLeave,this),n)),e.later(50,this,this.syncTargets),e.DD.DDM.regDelegate(this)},syncTargets:function(){if(!e.Plugin.Drop||this.get("destroyed"))return;var t,n,s;return this.get("target")&&(t=e.one(this.get(r)).all(this.get(i)),n=this.dd.get("groups"),s=this.get("dragConfig"),s&&s.groups&&(n=s.groups),t.each(function(e){this.createDrop(e,n)},this)),this},createDrop:function(t,n){var r={useShim:!1,bubbleTargets:this};return t.drop||t.plug(e.Plugin.Drop,r),t.drop.set("groups",n),t},destructor:function(){this.dd&&this.dd.destroy();if(e.Plugin.Drop){var t=e.one(this.get(r)).all(this.get(i));t.unplug(e.Plugin.Drop)}e.Array.each(this._handles,function(e){e.detach()})}},{NAME:"delegate",ATTRS:{container:{value:"body"},nodes:{value:".dd-draggable"},invalid:{value:"input, select, button, a, textarea"},lastNode:{value:s},currentNode:{value:s},dragNode:{value:s},over:{value:!1},target:{value:!1},dragConfig:{value:null},handles:{value:null}}}),e.mix(e.DD.DDM,{_delegates:[],regDelegate:function(e){this._delegates.push(e)},getDelegate:function(t){var n=null;return t=e.one(t),e.Array.each(this._delegates,function(e){t.test(e.get(r))&&(n=e)},this),n}}),e.namespace("DD"),e.DD.Delegate=n},"3.10.1",{requires:["dd-drag","dd-drop-plugin","event-mouseenter"]});
