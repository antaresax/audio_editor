/**
 * PM Front Common
 * @Constructor
 * @desc : 공통으로 사용되는 기능들
 *
 */

/**
 * Example
 * @desc :
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype.init = function(opts) {

	}

	//Constructor.App.ScrollBar = Fn;

})(window, document, PM.Front);


/**
 * hasAttr
 *
 */
$.fn.hasAttr = function(name) {
	try {
		return this.attr(name) !== undefined;
	} catch(e) {
		console.log('[Error Message] : ' + e.message);
	}
};

/**
 * uiSelect
 * @desc : 셀렉트 디자인
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype.init = function(opts) {

		var options = {
				target : opts.target
				, duration : 0.1
				, scrollInit : true
				, control : $(opts.target).hasAttr('data-control') ? true : false
				, addClass : opts.addClass ? opts.addClass : ''
			}

		$(options.target).each(function(originIndex) {

			var origin = $(this);

			// remove if module exist
			if ( origin.prev('.uiDesignSelect-wrap').length ) origin.prev('.uiDesignSelect-wrap').remove();

			var originOption = origin.find('option')
				, originDisplay = origin.attr('data-display') ? origin.attr('data-display') : 'inline-block'
				, originDisabled = origin.hasAttr('disabled') ? true : false
				, originWidth = origin.attr('data-width') ? parseInt(origin.attr('data-width'), 10) : null
				, originSelected = originOption.filter(':selected')
				, currentIdx = originSelected.index()
				, select = $('<div class="uiDesignSelect-wrap uiDesignSelect' + (originIndex+1) + ' ' + opts.addClass + '"></div>')
				, optionListWrap = $('<div class="uiDesignSelect-optionList"></div>').appendTo(select)
				, optionList = $('<div class="uiDesignSelect-ul"></div>').appendTo(optionListWrap);

			if ( options.control ) {

				var selected = $('<strong class="uiDesignSelect-selected"><button type="button" class="uiDesignSelect-prev"></button><a href="#" class="uiDesignSelect-trigger"><span class="uiDesignSelect-text">' + originSelected.html() + '</span><i class="uiDesignSelect-ico"></i></a><button type="button" class="uiDesignSelect-next"></button></strong>').prependTo(select)
					, btnPrev = selected.find('.uiDesignSelect-prev')
					, btnNext = selected.find('.uiDesignSelect-next');

			} else {
				var selected = $('<strong class="uiDesignSelect-selected"><a href="#" class="uiDesignSelect-trigger"><span class="uiDesignSelect-text">' + originSelected.html() + '</span><i class="uiDesignSelect-ico"></i></a></strong>').prependTo(select)
			}

			if ( originDisabled ) {
				select.addClass('disabled');
			}

			select.css({
				'zIndex' : $('.uiSelect').length - originIndex
				, 'display' : originDisplay
			});

			origin.addClass('uiOriginSelect uiOriginSelect'+(originIndex+1));
			originOption.each(function(i) {
				var thisHTML = $(this).html();
				$('<div class="uiDesignSelect-li"><a href="#" class="uiDesignSelect-listTrigger">' + thisHTML + '</a></div>').appendTo(optionList);
			});

			select.insertBefore(origin);

			optionListWrap.show().css('position','relative');

			// set Var
			var selectTrigger = selected.find('.uiDesignSelect-trigger')
				, selectedTriggerText = selectTrigger.find('.uiDesignSelect-text')
				, selectedIco = selectTrigger.find('.uiDesignSelect-ico')
				, optionLI = optionListWrap.find('.uiDesignSelect-li')
				, optionTrigger = optionList.find('.uiDesignSelect-listTrigger')
				, optionListWrapHeight = optionListWrap.outerHeight(true)
				, optionListWrapWidth = optionListWrap.outerWidth(true) + selectedIco.width();

			if ( originWidth != null ) {
				optionListWrapWidth = originWidth;
				optionListWrap.width(originWidth);
			}

			// scroll Init
			if ( options.scrollInit ) {
				optionListWrap.mCustomScrollbar({
					theme : 'dark'
					, autoHideScrollbar : true
				});
			}

			optionTrigger.css({
				width : optionListWrapWidth - 2
			});
			selected.css({
				width : optionListWrapWidth + parseInt(selectTrigger.css('border-left-width')) + parseInt(selectTrigger.css('border-right-width'))
			});

			optionTrigger.eq(currentIdx).addClass('uiSelect-active');

			// check slideUp or slideDown
			//checkUpDown();

			// height to 0
			optionListWrap.css('position','absolute').hide();

			// binding
			if ( !originDisabled ) {
				selectTrigger.on({
					click : function() {
						if ( optionListWrap.hasClass('uiSelect-state-open') ) {
							_hide();
						} else {
							_allHide();
							_show();
						}
						return false;
					}
				});
			}

			if ( options.control ) {
				btnPrev.on({
					click : function() {
						currentIdx -= 1;
						if ( currentIdx < 0 ) currentIdx = optionTrigger.length - 1;

						selectedTriggerText.text(optionTrigger.eq(currentIdx).html());
						_update();
					}
				});

				btnNext.on({
					click : function() {
						currentIdx += 1;
						if ( currentIdx >= optionTrigger.length ) currentIdx = 0;

						selectedTriggerText.text(optionTrigger.eq(currentIdx).html());
						_update();
					}
				});
			}

			optionTrigger.each(function(i) {
				$(this).on({
					click : function() {
						var _this = $(this)
							, thisText = _this.html();

						setTimeout(function() {
							selectedTriggerText.text(thisText);
						}, (options.duration*1000)/2);

						currentIdx = i;

						_hide();
						_update();

						return false;
					}
				});
			});

			$(document).on({
				'click.UiSelect' : function(e) {

					var e = e || window.event
						, target = $(e.target);

					if ( !target.parents('.uiDesignSelect-wrap').length ) {
						_hide();
					}
				}
			});

			// check slideUp or slideDown
			function checkUpDown() {
				var bodyHeight = $('body').height()
					, posY = select.offset().top
					, selectHeight = select.height() + optionListWrap.height() + 20;

				if ( bodyHeight < posY + selectHeight ) {
					//select.addClass('upSlide');
				}
			}

			// show optionList
			function _show() {
				//TweenMax.to(optionListWrap, options.duration, { height : optionListWrapHeight, ease : Power2.easeOut });
				optionListWrap.stop(true, true).slideDown(options.duration*1000);
				optionListWrap.addClass('uiSelect-state-open');
				selected.addClass('uiSelect-state-open');
			}

			// other select hide
			function _allHide() {
				var otherSelect = $('.uiDesignSelect-wrap').not(select);

				otherSelect.each(function() {
					var thisList = $(this).find('.uiDesignSelect-optionList')
						, thisSelected = $(this).find('.uiDesignSelect-selected');

					//TweenMax.to(thisList, options.duration, { height : 0, ease : Power2.easeOut });
					thisList.stop(true, true).slideUp(options.duration*1000);
					thisSelected.removeClass('uiSelect-state-open');
					thisList.removeClass('uiSelect-state-open');
				});
			}

			// hide optionList
			function _hide() {
				//TweenMax.to(optionListWrap, options.duration, { height : 0, ease : Power2.easeOut });
				optionListWrap.stop(true, true).slideUp(options.duration*1000);
				optionListWrap.removeClass('uiSelect-state-open');
				selected.removeClass('uiSelect-state-open');
			}

			// update to Origin
			function _update() {
				optionTrigger.removeClass('uiSelect-active');
				optionTrigger.eq(currentIdx).addClass('uiSelect-active');
				originOption.removeAttr('selected');
				originOption.eq(currentIdx).attr('selected','selected');
				origin.change();
			}

		});

	}

	Constructor.App.UiSelect = Fn;

})(window, document, PM.Front);

/**
 * ScrollBar
 * @desc : 스크롤바 디자인
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype.init = function(opts) {

		var opts = {
			target : opts.target
			, scrollSpeed : opts.scrollSpeed ? opts.scrollSpeed : 0
			, scrollAmount : opts.scrollAmount ? opts.scrollAmount : 200
			, axis : opts.axis ? opts.axis : 'y'
			, callbacks : opts.callbacks ? opts.callbacks : {}
		}

		$(opts.target).each(function() {

			var _this = $(this);

			_this.mCustomScrollbar({
				scrollInertia : opts.scrollSpeed
				, axis : opts.axis
				, theme : 'dark'
				, callbacks : opts.callbacks
			});
		});
	}

	Constructor.App.ScrollBar = Fn;

})(window, document, PM.Front);

/**
 * SideUtils
 * @desc : SideUtils 기능
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype.init = function(opts) {

		var wrap = $('#sideUtils')
			, mainTrigger = wrap.find('.mainFunction a')
			, cArea = wrap.find('.cArea')
			, sideOpener = wrap.find('.sideOpener')
			, sideArea = $('#sideContentWrapper')
			, bArea = $('#behaviorArea')
			, mTime = 0.1

		TweenMax.to(sideArea, 0, { left : -150 });
		TweenMax.to(bArea, 0, { left : 70 });
		TweenMax.to(wrap, 0, { width : 70 });
        
        openSideArea(); // 최초에 사이드메뉴 열어놓고 시작한다. (최초에 캔버스영역 스크롤바 보기싫어서..)

		sideOpener.on({
			click : function() {
				if ( sideArea.hasClass('open') ) {
					closeSideArea();
				} else {
					openSideArea();
				}
			}
		});

		mainTrigger.each(function() {
			var _this = $(this)
				, _target = $(_this.attr('href'));

			_this.on({
				click : function() {
					if ( !_this.hasClass('active') ) {
						mainTrigger.removeClass('active');
						_this.addClass('active');

						cArea.hide();
						_target.show();

						openSideArea();

						var select = new Constructor.App.UiSelect();

						select.init({
							target : '.uiSelect'
							, duration : 0.2
							, scrollInit : true
							, addClass : ''
						});

					}

					return false;
				}
			});
		});

		function openSideArea() {
			sideOpener.addClass('active');
			sideArea.addClass('open');
			TweenMax.to(sideArea, mTime, { left : 70 });
			TweenMax.to(bArea, mTime, { left : 270 });
			TweenMax.to(wrap, mTime, { width : 270 });
		}

		function closeSideArea() {
			sideOpener.removeClass('active');
			sideArea.removeClass('open');
			TweenMax.to(sideArea, mTime, { left : -150 });
			TweenMax.to(bArea, mTime, { left : 70 });
			TweenMax.to(wrap, mTime, { width : 70 });
		}

	}

	Constructor.App.SideUtil = Fn;

})(window, document, PM.Front);

/**
 * LayerDraggable
 * @desc : 레이어 Draggable
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype.init = function(opts) {

		$(opts.target).each(function() {
			var _this = $(this);

			_this.draggable({
				handle : _this.find(opts.handle)
				, scroll: false
			});

			_this.find(opts.handle).css('cursor','move');
		});
	}

	Constructor.App.LayerDraggable = Fn;

})(window, document, PM.Front);

/**
 * layer
 * @desc : layer 컨트롤
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype.init = function(opts) {

		var trigger = $('.layerOpener');

		trigger.each(function() {
			var target = $($(this).attr('href'));

			target.show();
			var inner = target.find('.layerInner')
				, originHeight = inner.outerHeight();
			target.hide();

			$(this).on({
				click : function() {

					if ( originHeight > $(window).height()-50 ) {
						inner.outerHeight($(window).height()-50);
						inner.css({
							marginTop : -(inner.outerHeight() / 2)
						});
						inner.find('.layerCont').css({
							position : 'absolute'
							, left : 0
							, right : 0
							, top : 30
							, bottom : 0
							, overflowX : 'hidden'
							, overflowY : 'auto'
						});
					} else {
						inner.css({
							height : originHeight
							, marginTop : -(originHeight/2)
						});
						inner.find('.layerCont').css({
							position : 'relative'
							, left : 'auto'
							, right : 'auto'
							, top : 'auto'
							, bottom : 'auto'
							, overflow : 'hidden'
						});
					}

					target.stop(true, true).fadeIn(150, function() {
						var select = new Constructor.App.UiSelect();

						select.init({
							target : '.uiSelect'
							, duration : 0.2
							, scrollInit : true
							, addClass : ''
						});
					});

					target.find('.layerCloser').off('click').on({
						click : function() {
							target.hide();
							target.find('.layerInner').removeAttr('style');
						}
					});

					return false;
				}
			});
		});

		$('.layerCloser').each(function() {
			$(this).on({
				click : function() {
					$(this).parents('.layerBox').hide().find('.layerInner').removeAttr('style');
				}
			});
		});

	}

	Constructor.App.Layer = Fn;

})(window, document, PM.Front);

/**
 * fontColorPicker
 * @desc : 폰트 색상 선택
 */
;(function (window, document, Constructor, undefined) {

	var Fn = function() {
	};

	Fn.prototype = {

		init : function(opts) {
			/*

			var _proto = this
				, trigger = $('#func_textbox .fontColor > a')
				, triggerColor = trigger.find('span')
				, layer = $('#func_textbox .fontColorLayer')
				, pickedColor = layer.find('.pickedColor')
				, colorValue = layer.find('.colorValue')
				, color = layer.find('.c');

			trigger.on({
				click : function() {
					if ( layer.is(':hidden') ) {
						trigger.addClass('active');
						layer.show();
					} else {
						trigger.removeClass('active');
						layer.hide();
					}
				}
			});

			color.each(function() {
				var thisColor = $(this).css('background-color');

				$(this).on({
					click : function() {
						pickedColor.css('background-color', thisColor);
						triggerColor.css('background-color', thisColor);
						colorValue.text(rgb2hex(thisColor).replace('#',''));
						Constructor.App.TextBoxFontColor = rgb2hex(thisColor);
						Constructor.App.TextBoxFontColorChanged();
					}
				});
			});

			function rgb2hex(rgb){
				rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
				return (rgb && rgb.length === 4) ? "#" +
					("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
					("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
					("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
			}
			*/

		}

		, callback : function(value) {
		}
	};


	Constructor.App.FontColorPicker = Fn;

})(window, document, PM.Front);