/**
 * PM Front Apps Initialize
 * @desc : 프론트 기본 기능을 실행한다.
 *
 */

;(function (window, document, Constructor, undefined) {

	$(function() {

		/*
		 * @SideUtil
		 * @사이드바 컨트롤
		 *
		 */
		(function() {
			var sideUtil = new Constructor.App.SideUtil();

			sideUtil.init();

			Constructor.Working.SideUtil = sideUtil;

		})();
        
		/*
		 * @Engine Init
		 * @캔버스 엔진 활성화
		 *
		 */
		(function() {

			var canvas = new Constructor.App.Canvas();

			canvas.init();

			/*
			PM.Front._canvas.alert('동일한 프로젝트 이름이 존재합니다.<br>새 이름을 입력하세요.', function() {
			});

			PM.Front._canvas.alert('<span class="color1">(저장완료)</span> 보관함에 저장되었습니다.<br><span class="color1">(편집하셨던 PC에서만 다시 불러올 수 있습니다.)</span><br><br>더 간편하게 이용하는 TIP!<br><br>바탕화면에서 포토몬 퀵포토북을 실행하면 포토몬<br>접속 없이도 바로 편집, 주문하실 수 있습니다!<br>더 빠르고 편하게 포토몬을 이용해 보세요.');

			PM.Front._canvas.alert('동일한 프로젝트 이름이 존재합니다.<br>새 이름을 입력하세요.', function() {
			});

			PM.Front._canvas.confirm('보관함에 임시 저장 되었습니다.<br>보관함으로 이동하시겠습니까?', function() {
				$('.saveBox.layerOpener').trigger('click');
			});

			*/
		})();

		/*
		 * @UiSelect
		 * @셀렉트 디자인화
		 *
		 */
		(function() {
			var select = new Constructor.App.UiSelect();

			select.init({
				target : '.uiSelect'
				, duration : 0
				, scrollInit : true
				, addClass : ''
			});

			Constructor.Working.UiSelect = select;

		})();

		/*
		 * @ScrollBar 세로
		 * @스크롤바 디자인화
		 *
		 */
		(function() {
			/*
			var scrollbar = new Constructor.App.ScrollBar();

			scrollbar.init({
				target : '.uiScrollBar'
				, scrollSpeed : 200
				, scrollAmount : 200
				, axis : 'y'
			});

			Constructor.Working.ScrollBarX = scrollbar;
			*/

		})();

		/*
		 * @ScrollBar 가로
		 * @스크롤바 디자인화
		 *
		 */
		(function() {

			$('.uiScrollBarX').mCustomScrollbar({
				scrollInertia : 200
				, axis : 'x'
				, theme : 'dark'
			});

		})();

		/*
		 * @LayerDraggable
		 * @레이어 Draggable
		 *
		 */
		(function() {
			var draggable = new Constructor.App.LayerDraggable();

			draggable.init({
				target : '.layerBox > .layerInner'
				, handle : '.layerTit'
			});

			Constructor.Working.LayerDraggable = draggable;

		})();

		/*
		 * @Layer
		 * @레이어 컨트롤
		 *
		 */
		(function() {
			var layer = new Constructor.App.Layer();

			layer.init();

			Constructor.Working.Layer = layer;

		})();

		/*
		 * @FontColorPicker
		 * @폰트 색상 선택
		 *
		 */
		(function() {
			var cPicker = new Constructor.App.FontColorPicker();

			cPicker.init();

			Constructor.Working.FontColorPicker = cPicker;

		})();

	});

})(window, document, PM.Front);