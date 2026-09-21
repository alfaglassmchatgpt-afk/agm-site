jQuery(document).ready(function($){
/****** COMMON START ******/
    Fancybox.bind("[data-fancybox]");

    const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.05,
    });

    let mobileMenu = new MobileMenu();
    mobileMenu.init();

    if(window.location.pathname === '/') {
        let theme_controllers = document.querySelectorAll('.theme-thumbler .theme-btn');
        if(theme_controllers) {
            let body = document.querySelector('body')
                white_black = document.querySelectorAll('.white-black');
                white_semiblack = document.querySelectorAll('.white-semiblack');
                gray_inverts = document.querySelectorAll('.gray-invert');
                image_inverted_holder = document.querySelectorAll('.image-inverted-holder');
                icon_inverted_holder = document.querySelectorAll('.icon-inverted-holder');
                border_inverted = document.querySelectorAll('.border-inverted');
    
            theme_controllers.forEach(el => {
                el.addEventListener('click', function() {
                    theme_controllers.forEach(item => {item.classList.remove('active')})
                    el.classList.add('active')
                    if(el.classList.contains('light-theme-btn')) {
                        body.classList.remove('dark-color')
                        body.classList.add('light-color')
    
                        white_black.forEach(item => { item.style.color = '#000' })
                        white_semiblack.forEach(item => { item.style.color = '#22282b' })
                        gray_inverts.forEach(item => { item.style.color = '#666' })
                        image_inverted_holder.forEach(element => {element.querySelector('.dark-image-invert').style.display = 'none'})
                        image_inverted_holder.forEach(element => {element.querySelector('.light-image-invert').style.display = 'flex'})
                        icon_inverted_holder.forEach(element => {
                            let icons = element.querySelectorAll('.icon-inverted')
                            icons.forEach(item => {item.style.filter = 'unset'})
                        })
                        border_inverted.forEach(el => {el.style.borderColor = '#d2e9f0'})
                    } else {
                        body.classList.remove('light-color')
                        body.classList.add('dark-color');
                        
                        white_black.forEach(item => { item.style.color = '#fff' })
                        white_semiblack.forEach(item => { item.style.color = '#fff' })
                        gray_inverts.forEach(item => { item.style.color = '#d3d3d3' })
                        image_inverted_holder.forEach(element => {element.querySelector('.light-image-invert').style.display = 'none'})
                        image_inverted_holder.forEach(element => {element.querySelector('.dark-image-invert').style.display = 'flex'})
                        icon_inverted_holder.forEach(element => {
                            let icons = element.querySelectorAll('.icon-inverted')
                            icons.forEach(item => {item.style.filter = 'brightness(0) invert(1)'})
                        })
                        border_inverted.forEach(el => {el.style.borderColor = 'rgba(255, 255, 255, 0.15)'})
                    }
                })
            })
        }
    }


    if ($(window).width() <= '996') {
        $('#mobile-mnu li.menu-item-has-children > a').on('click', function (e) {
            e.preventDefault();
            const parent  = $(this).parent();
            parent.toggleClass('is-opened')
            parent.find('ul.sub-menu').slideToggle();
        })
    }


    let search_form = document.querySelector('#searchform');
    if(search_form) {
        let search_input = search_form.querySelector('.search-input');
            search_submit = search_form.querySelector('#searchsubmit');
            submit_wrapper = search_form.querySelector('.submit-wrapper');

        search_submit.setAttribute('disabled','')
        submit_wrapper.addEventListener('click', function() {
            toggle(search_form)
        })
        search_input.addEventListener('input', function(ev) {
            if(ev.target.value.length != 0) {
                search_form.classList.add('not-empty')
                search_submit.removeAttribute('disabled')
            } else {
                search_form.classList.remove('not-empty')
                search_submit.setAttribute('disabled','')
            }
        })
    }


/****** COMMON END ******/
    let active_add = (item) => {
            item.classList.add('active')
        },
        active_remove = (item) => {
            item.classList.remove('active')
        },
        toggle = (item) => {
            item.classList.toggle('active')
        },
        error_add = (item) => {
            item.classList.add('error')
        },
        error_remove = (item) => {
            item.classList.remove('error')
        }


    let body = document.querySelector('body');
    let pageClass = window.location.pathname.replaceAll('/','');
    if(pageClass && pageClass.match('page')) {
        body.classList.add(pageClass)
    } else if(pageClass) {
        body.classList.add(`${pageClass}-page`)
    }
    window.isMobile = document.documentElement.clientWidth < 730;
    window.isTablet = document.documentElement.clientWidth < 1120;

    let policy = document.querySelectorAll('.wpcf7-form .wpcf7-acceptance label');
    if(policy) {
        policy.forEach(el => {
            let submitBtn = el.closest('.wpcf7-form').querySelector('.wpcf7-submit');
            submitBtn.onmouseover = function() {
                if(el.querySelector('input:checked')) {
                    el.classList.add('checked')
                    el.classList.remove('unchecked')
                } else {
                    el.classList.remove('checked')
                    el.classList.add('unchecked')
                }
            }
        })
    }


    $('.toggle-item .toggler').on('click', function() {
        let parent = $(this).closest('.toggle-item');
        parent.toggleClass('is-opened');
        parent.find('.toggle-content').slideToggle();
    });

    $('.toggle-item-second .toggler').on('click', function() {
        let parent = $(this).parent();
        let parent_of_parent = $(parent).parent();
        parent.toggleClass('is-opened')
        parent_of_parent.siblings().find('.toggle-item-second').removeClass('is-opened');
        parent.find('.toggle-content').slideToggle();
        parent_of_parent.siblings().find('.toggle-content').slideUp();
    });


    let tabs_holder = document.querySelectorAll('.tabs-holder');
    if(tabs_holder) {
        tabs_holder.forEach(el => {
            let btns = el.querySelectorAll('.tab-btn'),
                tabs = el.querySelectorAll('.tab-group')
                
            if(btns) {
                btns.forEach(item => {
                    item.addEventListener('click', function() {
                        btns.forEach(element => {active_remove(element)})
                        active_add(item)
                        tabs.forEach(tab => {
                            active_remove(tab)
                            if(tab.getAttribute('tab-id') === item.getAttribute('data-tab')) {
                                active_add(tab)
                            }
                        })
                    })
                })
            }
        })
    }


    let anchors = document.querySelectorAll('.anchor');
    if(anchors) {
        anchors.forEach(el => {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                let scroll_element = document.querySelector(el.getAttribute('href'));
                scroll_element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            })
        })
    }


    let hiddenText = document.querySelectorAll('.hidden-text');
    if(hiddenText) {
        hiddenText.forEach(el => {
            let stringLength = el.parentElement.getAttribute('string-length');
            if(stringLength != '') {
                let showBtn = el.parentElement.querySelector('.text-all-btn');
                if(Boolean(parseInt(stringLength) > el.textContent.length) === true) {
                    showBtn.remove()
                } else {
                    let originalText = el.innerHTML,
                        textCopy = originalText,
                        slicedText = `${el.innerHTML.slice(0,parseInt(stringLength))}`
                        el.innerHTML = slicedText;

                    if(showBtn) {
                        showBtn.addEventListener('click', function() {
                            toggle(this);
                            if(showBtn.classList.contains('active')) {
                                this.textContent = 'Свернуть';
                                el.innerHTML = textCopy;
                            } else { 
                                this.textContent = 'Подробнее';
                                el.innerHTML = slicedText;
                            }
                        })
                    }
                }
            }
        })
    }


    let allSwipers = document.querySelectorAll('.swiper');
    if(allSwipers) {
        allSwipers.forEach(el => {
            let swiperNav = el.parentElement.querySelector('.nav');
            let currentWidth = window.innerWidth
            setTimeout(function() {
                if(el.swiper === undefined) {
                    return;
                } else {
                    let swiperBreaks = el.swiper.passedParams.breakpoints
                    let matches = []
                    if(swiperBreaks) {
                        for (let p in swiperBreaks) {
                            if(currentWidth >= parseInt(p)) {
                                matches.push(p)
                            }
                        }
                    }
                    let lastMatches = matches.pop()
                    if(swiperBreaks) {
                        let currentBreak = []
                        Object.entries(swiperBreaks).forEach(item => {
                            if(lastMatches === item[0]) {
                                currentBreak.push(item)
                                if(el.swiper.slides.length <= currentBreak[0][1].slidesPerView) {
                                    swiperNav.style.display = 'none'
                                }
                            }
                        })
                    } else {
                        // if(el.swiper.slides.length <= el.swiper.passedParams.slidesPerView) {
                        //     swiperNav.style.display = 'none'
                        // }
                    }
                }
            }, 500)
        })
    }

    let works = document.querySelectorAll('.works-block .works .work-item')
    const swiper_works = new Swiper('.works-block .swiper', {
        direction: 'horizontal',
        navigation: {
            nextEl: '.works-block .swiper-button-next',
            prevEl: '.works-block .swiper-button-prev',
        },
        pagination: {
            el: '.works-block .swiper-pagination',
            type: 'bullets',
            clickable: true,
        },
        speed: 500,
        spaceBetween: 20,
        slidesPerView: 1,
        on: {
            slideChange: function () {
                works.forEach(item => {item.classList.remove('active')})
                this.slides.forEach(el => {
                    if(el.classList.contains('swiper-slide-active')) {
                        works.forEach(item => {
                            if(this.realIndex === parseInt(item.getAttribute('data-active'))) {
                                item.classList.add('active')
                                if(item.previousElementSibling) {
                                    item.previousElementSibling.classList.add('prev')
                                }
                                item.classList.remove('prev')
                            }
                        })
                    }
                })
            }
        }
    });


    const swiper_certs = new Swiper('.certificates-block .certs', {
		direction: 'horizontal',
		navigation: {
			nextEl: '.certificates-block .swiper-button-next',
			prevEl: '.certificates-block .swiper-button-prev',
		},
        pagination: {
            el: '.certificates-block .swiper-pagination',
            type: 'bullets',
            clickable: true,
        },
		speed: 500,
        spaceBetween: 20,
		breakpoints: {
			0: {
				slidesPerView: 1.15,
			},
			498: {
				slidesPerView: 2,
			},
            768: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 4,
			},
		},
	});


    const swiper_for = new Swiper('.for-who-block .planks', {
		direction: 'horizontal',
		navigation: {
			nextEl: '.for-who-block .swiper-button-next',
			prevEl: '.for-who-block .swiper-button-prev',
		},
        pagination: {
            el: '.for-who-block .swiper-pagination',
            type: 'bullets',
            clickable: true,
        },
		speed: 500,
        spaceBetween: 20,
		breakpoints: {
			0: {
				slidesPerView: 1.15,
			},
			498: {
				slidesPerView: 2,
			},
            996: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 4,
			},
		},
	});


    let block = document.querySelector('.goods-block .wrapper');
    let wrapper = document.querySelector('.goods-block .left-side-container')

    const thumbs = new Swiper('.goods-block .left-side', {
        direction: 'vertical',
        watchSlidesProgress: true,
        slidesPerView: 'auto',
        autoScrollOffset: 2,
        spaceBetween: 8,
        mousewheel: {
            sensitivity: 1.5,
            releaseOnEdges: true,
        },
        on: {
            slideChange: function () {
                if(this.activeIndex != 0) {
                    wrapper.classList.add('padded')
                } else {
                    wrapper.classList.remove('padded')
                }
            },
        },
    })


	const goods = new Swiper('.goods-block .right-side', {
		direction: 'vertical',
		slidesPerView: 1,
		spaceBetween: 5,
        navigation: {
            nextEl: '.goods-block .swiper-button-next',
            prevEl: '.goods-block .swiper-button-prev',
        },
        thumbs: {
            swiper: thumbs,
        },
        mousewheel: {
            sensitivity: 1.5,
            releaseOnEdges: true
        },
        on: {
            slideChange: function () {
                thumbs.slideTo(this.activeIndex);
            },
        },
	});

    if(block) {
        block.addEventListener('wheel', function(ev) {
            if(ev.deltaY === -100) {
                goods.slides.forEach(el => {
                    if(el.classList.contains('first')) {
                        if(el.classList.contains('swiper-slide-active')) {
                            return;
                        } else {
                            ev.preventDefault();
                            ev.stopPropagation();
                        }
                    }
                })
            }
            if(ev.deltaY === 100) {
                goods.slides.forEach(el => {
                    if(el.classList.contains('last')) {
                        if(el.classList.contains('swiper-slide-active')) {
                            return;
                        } else {
                            ev.preventDefault();
                            ev.stopPropagation();
                        }
                    }
                })
            }
        })
    }

    const mainbannerSwiper = new Swiper('.mainbanner-block .swiper', {
		direction: 'horizontal',
        effect: 'fade',
		speed: 500,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        // loop:true,
        pagination: { 
            el: '.mainbanner-block .swiper-pagination',
            type: 'bullets',
            clickable:  true,
        },
        slidesPerView: 1,
	});

    let videos = document.querySelectorAll('.mainbanner-block video');
    if(videos.length > 0) {
        // Autoplay may be denied; leave native playback controls available.
        videos[0].play().catch(function() {});
        mainbannerSwiper.on('slideChange', function() {
            if(mainbannerSwiper.activeIndex === mainbannerSwiper.slides.length) {
                setTimeout(function() {
                    mainbannerSwiper.slideToLoop(0);
                }, 5000)
            }
            videos.forEach(el => {
                el.currentTime = 0;
                if(parseInt(el.getAttribute('data-counter')) === mainbannerSwiper.activeIndex) {
                    el.play().catch(function() {});
                }
            })
        })
    }


    let this_block = document.querySelector('.personal-style-block')
    if(this_block) {
        images = this_block.querySelectorAll('.model-img'),
        mobile_images = this_block.querySelectorAll('.model-mobile-img');
        models = this_block.querySelectorAll('.model-item'),
        files = this_block.querySelectorAll('.model-file');
        drop = this_block.querySelector('.choise-drop');
        config = document.querySelector('.personal-style-block .config-holder');
        about_config = document.querySelector('.about-block .choised-config')
        about_config_drop = document.querySelector('.about-block .choise-drop')
        about_hidden = document.querySelector('.about-block .hidden-input')

        images.forEach(el => {if(el.getAttribute('data-img') === 'item-0-0') el.classList.add('active')});
    
        
        for (let i = 0 ; i < models.length; i++) {
            models[i].addEventListener('click' , function() {
                let similar_img = document.querySelector(`.personal-style-block [data-img=${this.getAttribute('data-item')}]`),
                    similar_file = document.querySelector(`.personal-style-block [data-file=${this.getAttribute('data-item')}]`);
                    similar_mobile_img = document.querySelector(`.personal-style-block [data-mobile-img=${this.getAttribute('data-item')}]`);
                
                models.forEach(el => {el.classList.remove('active')});
                images.forEach(el => {el.classList.remove('active')});
                files.forEach(el => {el.classList.remove('active')});
                mobile_images.forEach(el => {el.classList.remove('active')})
                category = this.closest('.cat-item__wrapper').querySelector('.cat-item__name p');
                this.classList.add('active')
                similar_img.classList.add('active')
                similar_file.classList.add('active');
                if(window.innerWidth < 768) {
                    similar_mobile_img.classList.add('active')
                }
                downloader(category.textContent,this.textContent)
            }); 
        }

        drop.addEventListener('click', function() {
            config.classList.remove('active')
            about_hidden.value = ''
        })
        about_config_drop.addEventListener('click', function() {
            about_config.classList.remove('active')
            about_hidden.value = ''
        })

        function downloader(cat,model) {
                choiser = config.querySelector('.choised .choise-drop');
                choised = config.querySelector('.choised-name');
                choised_p = choised.querySelector('p');
                choised_span = choised.querySelector('span');
                about_choised_p = about_config.querySelector('p');
                about_choised_span = about_config.querySelector('span')

            choised_p.textContent = `${cat}:`
            about_choised_p.textContent = `${cat}:`
            choised_span.textContent = model
            about_choised_span.textContent = model
            about_hidden.value = `${cat}: ${model}`
            config.classList.add('active')
            about_config.classList.add('active')
        }
    }


    const swiper_teams = new Swiper('.teams-block .teams', {
		direction: 'horizontal',
		navigation: {
			nextEl: '.teams-block .swiper-button-next',
			prevEl: '.teams-block .swiper-button-prev',
		},
        pagination: {
            el: '.teams-block .swiper-pagination',
            type: 'bullets',
            clickable: true,
        },
		speed: 500,
        spaceBetween: 20,
		breakpoints: {
			0: {
				slidesPerView: 1.15,
			},
			498: {
				slidesPerView: 2,
			},
            768: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 4,
			},
			1400: {
				slidesPerView: 4,
			},
		},
	});


    let success_modal = document.querySelector('#modal-success'),
        callback_modal = document.querySelector('#modal-callback'),
        background = document.querySelector('.modal-background'),
        close_modal = document.querySelectorAll('.close-modal-btn');

    document.addEventListener('wpcf7mailsent', function(event) {
        success()
        drop_callback()
        setTimeout(function() {
            drop_modals()
        }, 4000)
    })
    background.addEventListener('click', function() { drop_modals() })

    let callback_btns = document.querySelectorAll('[data-src=modal-callback')
    if(callback_btns) {
        console.log(callback_btns)
        callback_btns.forEach(el => {
            el.addEventListener('click', function() { console.log('rtyurtyu');callback() })
        })
    }
    if(background) {
        background.addEventListener('click', function() { drop_modals() })
    }
    if(close_modal) {
        close_modal.forEach(el => {
            el.addEventListener('click', function() { drop_modals() })
        }) 
    }

    function callback_trigger() {
        callback_modal.classList.add('active');
    }
    function succes_trigger() {
        success_modal.classList.add('active');
    }
    function background_trigger() {
        background.classList.add('modal-background-active')
    }
    function drop_background() {
        background.classList.remove('modal-background-active')
    }
    function drop_modal() {
        active_modals = document.querySelectorAll('.modal-window.active');
        active_modals.forEach(el => {
            el.classList.remove('active')
        })
    }
    function success() {
        background_trigger()
        succes_trigger()
    }
    function callback() {
        background_trigger()
        callback_trigger()
    }
    function drop_callback() {
        callback_modal.classList.remove('active')
    }
    function drop_modals() {
        drop_background()
        drop_modal()
    }
});