function appToast(msg) {
	//要先显示一下否则没法获取toast的宽度
	var $toast = $('<div class="kdx_toast">' + msg + '</div>').appendTo('body').show();
	var wh = $(window).height();
	var ww = $(window).width();

	var left = (ww - $toast.width()) / 2 + 'px';
	var top = (wh - $toast.height()) * 2 / 3 + 'px';

	$toast.hide();

	$toast
		.css({
			'left': left,
			'top': top
		})
		.appendTo('body')
		.fadeIn(500);
	//显示两秒后，消失
	setTimeout(function() {
		$toast.fadeOut(500, function() {
			$(this).remove();
		});
	}, 2000);

}