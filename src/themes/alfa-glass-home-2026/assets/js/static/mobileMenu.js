class MobileMenu {
	menu;
	burger;
	closeToggler;
	touchStats;
	constructor(menu) {
		this.menu = document.getElementById('mobile-mnu');
		this.burger = document.querySelector('.open_menu');
		this.closeToggler = document.querySelector('#mobile-mnu #close-mnu');
		this.touchStats = {
			'startX': 0,
			'startY': 0,
			'endX': 0,
			'endY': 0,
		};
		
		this.init = this.init.bind(this);
		this.destroy = this.destroy.bind(this);
		//
		this.setOpenMenuHandler = this.setOpenMenuHandler.bind(this);
		this.setCloseMenuHandler = this.setCloseMenuHandler.bind(this);
		this.setSwipeMenuHandler = this.setSwipeMenuHandler.bind(this);
		this.removeSwipeMenuHandler = this.removeSwipeMenuHandler.bind(this);
		//
		this.maybeCloseMenu = this.maybeCloseMenu.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.openMenu = this.openMenu.bind(this);
		this.closeMenu = this.closeMenu.bind(this);
		this.handleGesture = this.handleGesture.bind(this);
		this.onSwipeStart = this.onSwipeStart.bind(this);
		this.onSwipeEnd = this.onSwipeEnd.bind(this);
	}
	init() {
		if(!this.menu){
			alert('Мобильное меню не добавлено в DOM-дерево!');
			return;
		}
		this.setOpenMenuHandler();
		this.setCloseMenuHandler();
	}
	destroy() {
		this.removeCloseMenuHandler();
		this.removeSwipeMenuHandler();
	}
	//
	setOpenMenuHandler() {
		this.burger.addEventListener('click', this.toggleMenu,  {passive: true});
	}
	removeOpenMenuHandler() {
		this.burger.addEventListener('click', this.toggleMenu,  {passive: true});
	}
	setCloseMenuHandler() {
		this.closeToggler.addEventListener('click', this.closeMenu,  {passive: true});
		document.body.addEventListener('mouseup', this.maybeCloseMenu,  {passive: true});
	}
	removeCloseMenuHandler() {
		this.closeToggler.removeEventListener('click', this.closeMenu,  {passive: true});
		document.body.removeEventListener('mouseup', this.maybeCloseMenu,  {passive: true});
	}
	setSwipeMenuHandler() {
		this.menu.addEventListener('touchstart', this.onSwipeStart,  {passive: true});
		this.menu.addEventListener('touchend', this.onSwipeEnd,  {passive: true});
	}
	removeSwipeMenuHandler() {
		this.menu.removeEventListener('touchstart', this.onSwipeStart,  {passive: true});
		this.menu.removeEventListener('touchend', this.onSwipeEnd,  {passive: true});
	}
	//
	maybeCloseMenu(e) {
		var t = e.target;
		if(!this.menu.isEqualNode(t) && !this.burger.isEqualNode(t.parentElement) && !this.menu.contains(t))
		{
			this.closeMenu();
		}
	}
	toggleMenu() {
		if(this.menu.classList.contains('opened'))
		{
			this.closeMenu();
		}
		else
		{
			this.openMenu();
		}
	}
	openMenu() {
		this.burger.classList.add('clicked');
		this.menu.classList.add('opened');
		this.setCloseMenuHandler();
		this.setSwipeMenuHandler();
		this.openMenuEvent();
	}
	closeMenu() {
		this.menu.classList.remove('opened');
		this.burger.classList.remove('clicked');
		this.closeMenuEvent();
		this.destroy();
	}
	handleGesture() {
		var moveX = (this.touchStats.startX - this.touchStats.endX);
		var moveY = Math.abs(this.touchStats.startY - this.touchStats.endY);
		if (moveX > moveY && moveX > 15 ) {
			this.closeMenu();
		}
	}
	onSwipeStart(e) {
		this.touchStats.startX = e.changedTouches[0].screenX;
		this.touchStats.startY = e.changedTouches[0].screenY;
	}
	onSwipeEnd(e) {
		this.touchStats.endX = e.changedTouches[0].screenX;
		this.touchStats.endY = e.changedTouches[0].screenY;
		this.handleGesture();
	}
	openMenuEvent() {
		const event = new Event('menuOpened', {bubbles: true});
		document.dispatchEvent(event);
	}
	closeMenuEvent() {
		const event = new Event('menuClosed', {bubbles: true});
		document.dispatchEvent(event);
	}


}
window.MobileMenu = MobileMenu;