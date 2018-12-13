function SlideMenu(dom) {

	var $showMenuBtn = $(dom);
	//page_container添加遮罩层
	$('.page_container').append('<div class="shade"></div>');
	//初始化布局slide_menu_container  slide_menu    page_container 三者的位置关系
	$('.slide_menu_container').parent().css({
		'overflow': 'hidden',
		'padding': '0',
		'margin': '0'
	});
	var wh = $(window).height();
	var ww = $(window).width();
	var sw = ww * 0.7;
	var sh = wh;
	$('.slide_menu').css({
		'height': wh + 'px',
		'width': sw + 'px',
	});

	$('.page_container').css({
		'height': wh + 'px',
		'width': ww + 'px',
	});

	$('.slide_menu_container').css({
		'height': wh + 'px',
		'width': ww + sw + 'px',
		'left': '-' + sw + 'px'
	})

	this.showMenu = function(e) {
		e.stopPropagation();
		$('.slide_menu_container').animate({
			'left': '0px'
		}, 200);
		$('.page_container .shade').show();
		$('.page_container .shade').click(function(e) {
			e.stopPropagation();
			$('.slide_menu_container').animate({
				'left': '-' + sw + 'px'
			}, 200);
			$(this).off('click');
			$(this).hide();
		});
	};

	$showMenuBtn.click(this.showMenu);
}