
// 
//  appScroll.js
//  <project>
//  
//  Created by 840494388@qq.com on 2018-10-20.
//  Copyright 2018 kdx. All rights reserved.
// 
/**
 * 不要嵌套滑动，嵌套滑动需要修改代码
 * 对于body本身自带的滑动的嵌套，当前已经处理
 * @param {Object} jqdom 需要内部滚动的div的选择器
 * @param {Object} isNest 是否需要支持嵌套滑动（即滑动到顶端或者低端，会带动外层继续滑动）
 * @param {Object} isTransverse true为横向滑动
 */
function AppScroll(jqdom, isNest, isTransverse) {
	var currentY, lastY, currentX, lastX, offsetY, offestX;
	var $dom = $(jqdom);
	//$dom添加可滚动属性
	$dom.css('overflow', 'hidden');
	//横向滚动要使用一个确定宽度的div来包裹div的内容，
	//因为不管块级元素还是行内元素，遇到父div的边缘的时候都会换行，永远不会超出父级元素的边缘
	if(isTransverse) {
		var contentList = $dom.children();
		var childrenWidth = 0;
		var $tempDiv = $('<div></div>');
		for(var i = 0; i < contentList.length; i++) {
			var $child = $(contentList[i]);
			childrenWidth += $child.width();
			$child.remove().appendTo($tempDiv);
		}
		$tempDiv.css('width', childrenWidth + 'px').appendTo($dom);
	}

	$dom.on('touchmove', function(e) {
		if(isTransverse) {
			offestX = 0;
			var scrollX = $(this).scrollLeft(); //当前已滚动的距离
			var maxScrollX = $(this).get(0).scrollWidth - $(this).width(); //最大滚动距离
			currentX = e.originalEvent.touches[0].screenX;
			offestX = currentX - lastX;
			$(this).scrollLeft(scrollX - offestX);
			lastX = currentX;
		} else {
			offestY = 0;
			var scrollY = $(this).scrollTop(); //当前已滚动的距离
			var maxScrollY = $(this).get(0).scrollHeight - $(this).height(); //最大滚动距离
			currentY = e.originalEvent.touches[0].screenY;
			offestY = currentY - lastY;
			if(!isNest) {
				e.preventDefault(); //阻止默认动作（否则document的滑动还是会有冲突，因为document的滑动是浏览器默认事件）
				e.stopPropagation(); //阻止事件冒泡
			} else {
				//判断滑动方向处理body的滑动
				if(!(offestY > 0 && scrollY == 0) && !(offestY < 0 && scrollY == maxScrollY)) { //滚动到顶端或者低端后，body可以正常滑动
					e.preventDefault(); //阻止默认动作（否则document的滑动还是会有冲突，因为document的滑动是浏览器默认事件）
					e.stopPropagation(); //阻止事件冒泡
				}
			}
			$(this).scrollTop(scrollY - offestY);
			lastY = currentY;
		}
	});

	$dom.on('touchstart', function(e) {
		lastY = e.originalEvent.changedTouches[0].screenY;
		lastX = e.originalEvent.changedTouches[0].screenX;
	});

	$dom.on('touchend', function(e) {
		lastY = e.originalEvent.changedTouches[0].screenY;
		lastX = e.originalEvent.changedTouches[0].screenX;
	});
}

/**
 * 针对页面的触屏滑动事件，上下拉下拉刷新（不是针对局部div的）
 * @param {option} option 需要定义的参数

 */
function PullRefresh(option) {

	var currentY, lastY, offsetY;
	var isPullDown = false;
	var isPullDowning = false;
	var isPullUp = false;
	var isPullUping = false;
	var firstPullUpY;
	var firstPullDownY;
	var pullDownOffsetY = 0; //开始下拉时，下拉的距离
	var pullUpOffsetY = 0;

	var pullDownCallBack, pullUpCallBack, pullDownDiv, pullUpDiv, pullDownDivChangeCallBack, pullUpDivChangeCallBack, preRefresh;

	pullDownCallBack = option.pullDownCallBack;
	pullUpCallBack = option.pullUpCallBack;
	pullDownDiv = option.pullDownDiv;
	pullUpDiv = option.pullUpDiv;
	pullDownDivChangeCallBack = option.pullDownDivChangeCallBack;
	pullUpDivChangeCallBack = option.pullUpDivChangeCallBack;
	preRefresh = option.preRefresh;
	//上拉加载时需要改变或者显示的页面元素
	var $pullUpDiv = $(pullUpDiv);
	//下拉之后需要改变或者显示的页面元素
	var $pullDownDiv = $(pullDownDiv);
	//页面的滑动对象是html标签
	$dom = $(document);

	//刷新结束方法
	this.pullDownRefreshFinish = function(data) {
		isPullDowning = false;
		isPullDown = false;
		$pullDownDiv.animate({
			'height': '0px'
		}, 100);
	};
	this.pullUpRefreshFinish = function(data) {
		isPullUping = false;
		isPullUp = false;
		$pullUpDiv.animate({
			'height': '0px'
		}, 100);
	};

	$dom.on('touchmove', function(e) {
		offestY = 0;
		var scrollY = $(this).scrollTop(); //当前已滚动的距离
		var maxScrollY = $(this).height() - $(window).height(); //最大滚动距离
		var currentY = e.originalEvent.touches[0].screenY;
		offestY = currentY - lastY;

		//判断滑动方向处理body的滑动
		if(offestY > 0 && scrollY == 0 && pullDownCallBack) { //滚动到顶端后，如果继续下滑，进入下拉刷新逻辑
			if(!isPullDown) { //记录第一次进入下拉状态时的的触点坐标
				isPullDown = true;
				firstPullDownY = currentY;
			} else {
				pullDownOffsetY = currentY - firstPullDownY;
				$pullDownDiv.css('height', pullDownOffsetY + 'px');
				if(pullDownOffsetY >= 50) { //如果下拉距离超过50，进入下拉逻辑
					isPullDowning = true;
				}
			}
		} else { //上滑的逻辑
			pullDownOffsetY = currentY - firstPullDownY;
			isPullDown = false;
			if(pullDownOffsetY < 50) {
				isPullDowning = false;
			}
		}

		if(offestY < 0 && scrollY >= maxScrollY && pullUpCallBack) { //滚动到底端后，如果继续上滑，进入上拉加载逻辑

			isPullUp = true;
			isPullUping = true;
			//			if(!isPullUp) { //记录第一次进入下拉状态时的的触点坐标
			//				isPullUp = true;
			//				firstPullUpY = currentY;
			//			} else {
			//				pullUpOffsetY = firstPullUpY - currentY;
			//				$pullUpDiv.css('height', pullUpOffsetY + 'px');
			//				if(pullUpOffsetY >= 50) { //如果下拉距离超过50，进入下拉逻辑
			//					isPullUping = true;
			//				}
			//			}
		}
		//		else { //下滑
		//			pullUpOffsetY = currentY - firstPullUpY;
		//			isPullUp = false;
		//			if(pullUpOffsetY < 50) {
		//				isPullUping = false;
		//			}
		//		}

		lastY = currentY;
	});

	$dom.on('touchstart', function(e) {
		lastY = e.originalEvent.changedTouches[0].screenY;
	});

	$dom.on('touchend', function(e) {
		lastY = e.originalEvent.changedTouches[0].screenY;
		if(!isPullDowning) {
			$pullDownDiv.animate({
				'height': '0px'
			}, 100);
		} else {
			$pullDownDiv.animate({
				'height': '50px'
			}, 100);
			if(pullDownDivChangeCallBack) {
				pullDownDivChangeCallBack();
			}
			if(pullDownCallBack) {
				pullDownCallBack();
			}
		}
		if(!isPullUping) {
			$pullUpDiv.animate({
				'height': '0px'
			}, 100);
		} else {
			$pullUpDiv.animate({
				'height': '30px'
			}, 100);
			if(pullUpDivChangeCallBack) {
				pullUpDivChangeCallBack();
			}
			if(pullUpCallBack) {
				pullUpCallBack();
			}
		}
	});
}