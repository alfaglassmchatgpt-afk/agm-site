(function($) {
    'use strict';
    
    console.log('=== Конфигуратор товаров: ИНИЦИАЛИЗАЦИЯ ===');

    // Перехват ответа CF7: google-sheets.php в footer часто не доезжает
    // (кэш / PageSpeed). Этот файл точно грузится на странице товара.
    (function interceptCf7Feedback() {
        console.log('[Alfa Glass] Перехват CF7 /feedback включён');

        if (typeof window.fetch === 'function') {
            var origFetch = window.fetch.bind(window);
            window.fetch = function(input, init) {
                var url = typeof input === 'string' ? input : (input && input.url) || '';
                var req = origFetch(input, init);
                var isFeedback = String(url).indexOf('contact-forms/') !== -1
                    && String(url).indexOf('/feedback') !== -1
                    && String(url).indexOf('/schema') === -1;

                if (isFeedback) {
                    req.then(function(res) {
                        res.clone().json().then(function(data) {
                            console.log('[Alfa Glass] CF7 /feedback status:', data.status, '|', data.message);
                            console.log('[Alfa Glass] google_sheets:', data.google_sheets || 'НЕТ КЛЮЧА — google-sheets.php не сработал на сервере');
                            console.log('[Alfa Glass] request_post:', data.request_post || 'НЕТ КЛЮЧА — запись request не создавалась');
                        }).catch(function() {
                            console.warn('[Alfa Glass] /feedback вернул не JSON');
                        });
                        return res;
                    }).catch(function(err) {
                        console.warn('[Alfa Glass] fetch /feedback ошибка', err);
                    });
                }

                return req;
            };
        }

        document.addEventListener('wpcf7submit', function(ev) {
            var form = ev.target;
            if (form && form.querySelector && !form.querySelector('input[name="_wpcf7_posted_data_hash"]')) {
                var hashInput = document.createElement('input');
                hashInput.type = 'hidden';
                hashInput.name = '_wpcf7_posted_data_hash';
                form.appendChild(hashInput);
            }
        }, true);
    })();
    
    // Переменная для кэширования данных конфигуратора
    let cachedConfigData = null;
    
    // ==================== ФУНКЦИОНАЛ СМЕНЫ ИЗОБРАЖЕНИЙ ====================
    
    /**
     * Переключение миниатюр при выборе опции "Цвет подсветки"
     */
// Универсальная функция переключения (принимает элемент radio или кнопку)
function switchThumbnail(sourceEl) {
  if (!sourceEl) return;

  // Попробуем получить blockId и selectedValue из разных мест
  let blockId = null;
  let selectedValue = null;

  // Если это радиокнопка внутри .js-backlight-color, используем родителя
  const optionBlock = sourceEl.closest && sourceEl.closest('.js-backlight-color');
  if (optionBlock && optionBlock.dataset.blcId) {
    blockId = optionBlock.dataset.blcId;
  }

  // fallback: читать напрямую из data-атрибутов элемента
  if (!blockId) blockId = sourceEl.dataset && sourceEl.dataset.blcId ? sourceEl.dataset.blcId : null;

  // значение может быть value (у input) или data-value/data-description у кнопки
  selectedValue = sourceEl.value || (sourceEl.dataset && (sourceEl.dataset.value || sourceEl.dataset.description)) || null;

  if (!blockId || !selectedValue) return;

  // Найти все блоки миниатюр с этим ID (чтобы менять в обеих галереях)
  const thumbBlocks = document.querySelectorAll(`.thumbnails[data-blc-thumbs="${blockId}"]`);
  if (!thumbBlocks || !thumbBlocks.length) return;

  thumbBlocks.forEach(thumbBlock => {
    // Удаляем актив у всех миниатюр в блоке
    thumbBlock.querySelectorAll('.thumbnail._active').forEach(t => t.classList.remove('_active'));

    // Ищем целевой img по data-description или data-value
    const selector = `img[data-description="${selectedValue}"], img[data-value="${selectedValue}"]`;
    const targetImg = thumbBlock.querySelector(selector);

    if (targetImg) {
      const parentThumbnail = targetImg.closest('.thumbnail');
      if (parentThumbnail) {
        parentThumbnail.classList.add('_active');
        // Триггер клика по миниатюре, чтобы сменилось главное изображение
        parentThumbnail.click();
      }
    }
  });

  // Инвалидируем кэш конфигуратора
  cachedConfigData = null;
}

// Инициализация: радио-элементы и дополнительные кнопки
function initImageSwitcher() {
  console.log('Инициализация переключения изображений...');

  // Радио (как было)
  document.querySelectorAll('.js-backlight-color input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        switchThumbnail(this);
      }
    });
  });

  // Дополнительные кнопки — предполагается, что у них есть data-blc-id и data-value или data-description
  document.querySelectorAll('.js-backlight-button, [data-blc-id][data-value], [data-blc-id][data-description]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      // Можно пометить кнопку визуально активной, если нужно
      // const wrap = this.closest('.buttons-wrap'); if (wrap) { wrap.querySelectorAll('.js-backlight-button._active').forEach(b => b.classList.remove('_active')); this.classList.add('_active'); }
      switchThumbnail(this);
    });
  });

  // Активировать по умолчанию: радиокнопки и активные кнопки
  setTimeout(function() {
    document.querySelectorAll('.js-backlight-color').forEach(optionBlock => {
      const defaultRadio = optionBlock.querySelector('input[type="radio"]:checked');
      if (defaultRadio) switchThumbnail(defaultRadio);
    });

    document.querySelectorAll('.js-backlight-button._active, [data-blc-id][data-value]._active, [data-blc-id][data-description]._active').forEach(btn => {
      switchThumbnail(btn);
    });
  }, 100);

  console.log('✅ Переключение изображений инициализировано');
}
    
    //function switchThumbnail(radioElement) {
    //    // Находим блок опций
    //    const optionBlock = radioElement.closest('.js-backlight-color');
    //    if (!optionBlock) return;
    //    
    //    // Получаем ID блока
    //    const blockId = optionBlock.dataset.blcId;
    //    if (!blockId) return;
    //    
    //    // Получаем значение радио
    //    const selectedValue = radioElement.value;
    //    
    //    // Находим ВИДИМЫЙ блок thumbnails
    //    const allThumbBlocks = document.querySelectorAll(`.thumbnails[data-blc-thumbs="${blockId}"]`);
    //    let visibleThumbBlock = null;
    //    
    //    for (const block of allThumbBlocks) {
    //        if (getComputedStyle(block).display !== 'none') {
    //            visibleThumbBlock = block;
    //            break;
    //        }
    //    }
    //    
    //    if (!visibleThumbBlock) return;
    //    
    //    // Обновляем миниатюры
    //    visibleThumbBlock.querySelectorAll('.thumbnail._active').forEach(thumb => {
    //        thumb.classList.remove('_active');
    //    });
    //    
    //    const targetImg = visibleThumbBlock.querySelector(`img[data-description="${selectedValue}"]`);
    //    if (targetImg) {
    //        const parentThumbnail = targetImg.closest('.thumbnail');
    //        if (parentThumbnail) {
    //            parentThumbnail.classList.add('_active');
    //            parentThumbnail.click();
    //        }
    //    }
    //    
    //    // Инвалидируем кэш данных конфигуратора
    //    cachedConfigData = null;
    //}
    //
    ///**
    // * Инициализация переключения изображений
    // */
    //function initImageSwitcher() {
    //    console.log('Инициализация переключения изображений...');
    //    
    //    // Вешаем обработчики на все радио-кнопки в группах .js-backlight-color
    //    document.querySelectorAll('.js-backlight-color input[type="radio"]').forEach(radio => {
    //        radio.addEventListener('change', function() {
    //            if (this.checked) {
    //                switchThumbnail(this);
    //            }
    //        });
    //    });
    //    
    //    // Активируем выбранную по умолчанию опцию
    //    setTimeout(function() {
    //        document.querySelectorAll('.js-backlight-color').forEach(optionBlock => {
    //            const defaultRadio = optionBlock.querySelector('input[type="radio"]:checked');
    //            if (defaultRadio) {
    //                switchThumbnail(defaultRadio);
    //            }
    //        });
    //    }, 100);
    //    
    //    console.log('✅ Переключение изображений инициализировано');
    //}
    
    // ==================== ФУНКЦИОНАЛ СБОРА ДАННЫХ ДЛЯ EMAIL ====================
    
    /**
     * Собирает данные из всех групп конфигуратора
     */
    function collectConfiguratorData(forceRefresh = false) {
        // Если есть кэш и не форсируем обновление - возвращаем кэш
        if (cachedConfigData && !forceRefresh) {
            console.log('--- Используем кэшированные данные конфигуратора ---');
            return cachedConfigData;
        }
        
        console.log('--- Собираем данные конфигуратора ---');
        
        const allLines = [];
        
        // Проходим по каждой группе конфигуратора
        $('.cfig__group[data-email-template]').each(function(index) {
            const $group = $(this);
            const template = $group.data('email-template');
            
            // Обрабатываем группу и получаем строку для email
            const emailLine = processGroup($group, template);
            
            if (emailLine) {
                allLines.push(emailLine);
            }
        });
        

        // Объединяем все строки в один текст С ПЕРЕННОСАМИ
        // Вариант 1: С обычными переносами
        const result = allLines.join('\n'); // Два переноса между группами
        
        // Вариант 2: С HTML-тегами
        // const result = allLines.map(line => line + '<br>').join('');
        //const result = allLines.join('<br><br>');
        
        // Вариант 3: С параграфами
        // const result = allLines.map(line => '<p>' + line + '</p>').join('');
        
        // Кэшируем результат
        cachedConfigData = result;
        
        // Выводим в консоль для отладки
        displayEmailResult(result);
        
        return result;
    }
    
    /**
     * Обрабатывает одну группу
     */
    function processGroup($group, template) {
        let result = template;
        
        const checkboxes = $group.find('input[type="checkbox"]');
        const radios = $group.find('input[type="radio"]');
        
        if (checkboxes.length > 0 || radios.length > 0) {
            return processCheckboxRadioGroup($group, template, checkboxes, radios);
        }
        
        $group.find('input:not([type="checkbox"]):not([type="radio"]), select, textarea').each(function() {
            const $field = $(this);
            const fieldName = $field.attr('name');
            const fieldValue = getFieldValue($field);
            
            const placeholder = `{${fieldName}}`;
            if (result.includes(placeholder)) {
                const displayValue = fieldValue !== null ? fieldValue : '—';
                result = result.replace(placeholder, displayValue);
            }
        });
        
        return result;
    }
    
    /**
     * Обрабатывает группы с чекбоксами и радио-кнопками
     */
    function processCheckboxRadioGroup($group, template, checkboxes, radios) {
        let result = template;
        
        const totalCheckboxes = checkboxes.length;
        const totalRadios = radios.length;
        
        if (totalRadios > 0 && totalCheckboxes === 0) {
            const checkedRadio = $group.find('input[type="radio"]:checked');
            if (checkedRadio.length > 0) {
                const fieldName = checkedRadio.attr('name');
                const fieldValue = checkedRadio.val() || 'Да';
                const placeholder = `{${fieldName}}`;
                
                if (result.includes(placeholder)) {
                    result = result.replace(placeholder, fieldValue);
                }
            } else {
                const firstRadio = radios.first();
                const fieldName = firstRadio.attr('name');
                const placeholder = `{${fieldName}}`;
                
                if (result.includes(placeholder)) {
                    result = result.replace(placeholder, '—');
                }
            }
        } else if (totalCheckboxes > 0) {
            const selectedValues = [];
            
            checkboxes.each(function() {
                const $checkbox = $(this);
                if ($checkbox.is(':checked')) {
                    const value = $checkbox.val() || 'Да';
                    selectedValues.push(value);
                }
            });
            
            const firstCheckbox = checkboxes.first();
            const fieldName = firstCheckbox.attr('name');
            const placeholder = `{${fieldName}}`;
            
            if (result.includes(placeholder)) {
                if (selectedValues.length > 0) {
                    if (totalCheckboxes === 1) {
                        result = result.replace(placeholder, selectedValues[0]);
                    } else {
                        const listItems = selectedValues.map(value => `  • ${value}`).join('\n');
                        result = result.replace(placeholder, `\n${listItems}`);
                    }
                } else {
                    result = result.replace(placeholder, '—');
                }
            }
        }
        
        return result;
    }
    
    function getFieldValue($field) {
        const type = $field.attr('type');
        const value = $field.val();
        
        if (type === 'number') {
            return value !== '' ? value.trim() : null;
        }
        
        if (value && value.trim() !== '') {
            return value.trim();
        }
        
        if ($field.is('select')) {
            const selectedOption = $field.find('option:selected');
            if (selectedOption.length && selectedOption.val()) {
                return selectedOption.val().trim();
            }
            return null;
        }
        
        return null;
    }
    
    function displayEmailResult(result) {
        console.log(
            `%c=== ДАННЫЕ КОНФИГУРАТОРА ===\n${result}\n==========================`,
            `
            background: #007cba;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            white-space: pre-wrap;
            display: block;
            `
        );
    }
    
    // ==================== ИНТЕГРАЦИЯ С ФОРМОЙ CF7 ====================
    
    /**
     * Заполняет форму CF7 данными конфигуратора
     */
    function fillCF7FormWithConfigData() {
        console.log('--- Заполняем форму CF7 данными конфигуратора ---');
        
        // 1. Находим модальное окно с формой
        const modalForm = document.getElementById('cfr-modal-form');
        if (!modalForm) {
            console.warn('Модальное окно cfr-modal-form не найдено');
            return;
        }
        
        // 2. Находим форму CF7 внутри модалки
        const cf7Form = modalForm.querySelector('.wpcf7-form');
        if (!cf7Form) {
            console.warn('Форма CF7 не найдена в модальном окне');
            return;
        }
        
        // 3. Ищем поле configurator-data
        const configField = cf7Form.querySelector('[name="configurator-data"]');    // данные для письма (в скрытое поле)
        const configViewSelected = cf7Form.querySelector('.js-cfig-view-selected'); // для формы, показать что выбрал сам пользователь
        const formItemName = cf7Form.querySelector('.cfig-form-item-name');         // название поля для имени товара в форме
        const prodNameH1text = document.querySelector('h1.item__title');

        if (!configField) {
            console.warn('Поле configurator-data не найдено в форме');
            return;
        }
        
        // 4. Собираем данные конфигуратора
        const configData = collectConfiguratorData(true);
        
        // 5. Заполняем поле
        configViewSelected.innerHTML = cleanText(configData);
        console.log('__________________')
        console.log(configViewSelected.innerHTML)
        console.log('__________________')

        configField.value = configData;
        formItemName.textContent = prodNameH1text.textContent;
        
        console.log('✅ Данные конфигуратора добавлены в форму CF7');
        
        // Для отладки
        if (configData) {
            console.log('📋 Содержимое поля:', configData);
        }
    }



    /**
     * Инициализация интеграции с CF7
     */
    function initCF7Integration() {
        console.log('Инициализация интеграции с CF7...');
        
        // Находим все кнопки открытия формы
        const openButtons = document.querySelectorAll('[data-modal-target="cfr-modal-form"]');
        
        if (openButtons.length === 0) {
            console.warn('Кнопки открытия формы cfr-modal-form не найдены');
            return;
        }
        
        // Вешаем обработчик на каждую кнопку
        openButtons.forEach(button => {
            // Удаляем старые обработчики, если есть
            button.removeEventListener('click', handleFormOpen);
            // Добавляем новый
            button.addEventListener('click', handleFormOpen);
        });
        
        function handleFormOpen(e) {
            console.log('Клик по кнопке открытия формы');
            // Задержка, чтобы модалка успела открыться
            setTimeout(fillCF7FormWithConfigData, 100);
        }
        
        // Инвалидируем кэш при изменении в конфигураторе
        $('.cfig input, .cfig select').on('change', function() {
            console.log('Изменение в конфигураторе - инвалидируем кэш');
            cachedConfigData = null;
        });
        
        console.log(`✅ Найдено ${openButtons.length} кнопок открытия формы`);
    }
    
    // ==================== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ====================
    
    /**
     * Инициализация всего функционала
     */
    function initAll() {
        console.log('=== ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ ===');
        
        // 1. Инициализируем переключение изображений
        initImageSwitcher();
        
        // 2. Инициализируем интеграцию с CF7
        initCF7Integration();
        
        // 3. Собираем начальные данные (для отладки)
        setTimeout(() => {
            collectConfiguratorData();
        }, 200);
        
        console.log('✅ Все функции инициализированы');
    }
    
    // Запускаем при загрузке DOM
    $(document).ready(function() {
        console.log('DOM готов - запускаем инициализацию');
        initAll();
    });
    
    // Делаем функции доступными глобально
    window.collectConfiguratorData = collectConfiguratorData;
    window.fillCF7FormWithConfigData = fillCF7FormWithConfigData;
    window.switchThumbnail = switchThumbnail;


    /**
     * Переделаем данные из скрытого поля для открытого...
     * @param {*} input 
     * @returns 
     */
    function cleanText(input) {
    const lines = input.split(/\r?\n/);

    const merged = [];
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // если строка заканчивается двоеточием (включая пробелы перед концом)
        if (/: *$/.test(line)) {
        let j = i + 1;
        const collected = [];
        while (j < lines.length) {
            const next = lines[j];
            if (/^\s*$/.test(next)) { j++; continue; }
            if (/^\s*•/.test(next) || /^\s+/.test(next)) {
            collected.push(next);
            j++;
            continue;
            }
            break;
        }

        if (collected.length) {
            merged.push(line.replace(/\s+$/, '') + '\n' + collected.join('\n'));
            i = j - 1;
            continue;
        }
        }

        merged.push(line);
    }

    return merged
        .map(line => {
            if (/^\sАдрес для замерщика\s*:/i.test(line)) return '';
            const idx = line.indexOf(':');
            if (idx === -1) return line.trim();

            const before = line.slice(0, idx + 1);
            let after = line.slice(idx + 1);

            // если есть буллеты — собрать их в одно значение
            if (after.includes('•')) {
                const items = after
                .split('\n')
                .map(s => s.replace(/^\s*•\s?/, '').trim())
                .map(s => s.replace(/\s+/g, ' '))
                .filter(s => s !== '' && s !== '—' && !/^—x—см$/i.test(s));

                after = items.join(', ');
            } else {
                after = after.trim();
            }

            // удалить точные плейсхолдеры или пустые значения
            const norm = after.replace(/\s+/g, '');

if (!after || norm === '—' || /^—x—см$/i.test(after) || /^—см$/i.test(after)) return '';

            // обернуть всё значение в <b>
            const wrapped = '<b>' + escapeHtml(after) + '</b>';
            //if(before === 'Адрес для замерщика:') return '';
            return (before + ' ' + wrapped).trim();
        })
        .filter(Boolean)
        .join('<br>');
    }

    // простая экранировка HTML для безопасности, чтобы внутри <b> не было ломающих тегов
    function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }


    /**
 * Отслеживание изменения чекбокса "вызов замерщика"
 * При включении должно раскрываться поле для ввода адреса
 */
const measurerGroup = document.querySelector('.js-g-measurer');
const addressGroup = document.querySelector('.js-g-address');

if (measurerGroup && addressGroup) {
    // Находим ДВА чекбокса
    const checkboxes = measurerGroup.querySelectorAll('input[type="checkbox"]');
    const adrsInput = addressGroup.querySelector('input[type="text"]');
    
    if (checkboxes.length >= 2 && adrsInput) {
        // Проверяем, активен ли ХОТЯ БЫ ОДИН чекбокс
        const isAnyChecked = checkboxes[0].checked || checkboxes[1].checked;
        addressGroup.style.display = isAnyChecked ? 'block' : 'none';
        
        // Вешаем обработчик на КАЖДЫЙ из двух чекбоксов
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Простая проверка: первый ИЛИ второй чекбокс активен
                const showAddress = checkboxes[0].checked || checkboxes[1].checked;
                
                if (showAddress) {
                    console.log('✅ Один из чекбоксов включен - показываем адрес');
                    addressGroup.style.display = 'block';
                    adrsInput.focus();
                } else {
                    console.log('❌ Оба чекбокса выключены - скрываем адрес');
                    addressGroup.style.display = 'none';
                    addressGroup.classList.remove('_error');
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Находим ДВА чекбокса и связанные элементы
    const checkboxes = document.querySelectorAll('.js-g-measurer input[type="checkbox"]');
    const addr = document.querySelector('.js-g-address input[type="text"]');
    const addrGroup = document.querySelector('.js-g-address');
    
    // Фильтр только цифр (оставляем как было)
    if (addr) {
        addr.addEventListener('input', () => addr.value = addr.value.replace(/[a-zA-Z]/g, ''));
    }
    
    // Функция проверки активен ли хоть один чекбокс
    const isAnyCheckboxChecked = () => {
        return Array.from(checkboxes).some(cb => cb.checked);
    };
    
    if (checkboxes.length > 0 && addr && addrGroup) {
        // Устанавливаем начальное состояние
        addrGroup.style.display = isAnyCheckboxChecked() ? 'block' : 'none';
        
        // ПРОВЕРЯЕМ ВАЛИДНОСТЬ ПРИ ЗАГРУЗКЕ если хоть один чекбокс активен!
        if (isAnyCheckboxChecked()) {
            const v = addr.value.trim();
            const isValid = v.length >= 5 && /[а-яА-Яa-zA-Z]/.test(v) && /\d/.test(v);
            
            if (!isValid) {
                addrGroup.classList.add('_error');
            }
        }
        
        // Вешаем обработчик на КАЖДЫЙ чекбокс
        checkboxes.forEach(checkbox => {
            checkbox.onchange = () => {
                addrGroup.style.display = isAnyCheckboxChecked() ? 'block' : 'none';
                
                if (isAnyCheckboxChecked()) {
                    // При включении проверяем адрес
                    const v = addr.value.trim();
                    const isValid = v.length >= 5 && /[а-яА-Я]/.test(v) && /\d/.test(v);
                    
                    if (!isValid) {
                        addrGroup.classList.add('_error');
                    } else {
                        addrGroup.classList.remove('_error');
                    }
                    
                    // Фокус на поле адреса
                    addr.focus();
                } else {
                    // При выключении ВСЕХ чекбоксов сбрасываем ошибку
                    addrGroup.classList.remove('_error');
                }
            };
        });
    }
    
    // Обработчик для кнопок открытия попапа (оставляем как было)
    document.querySelectorAll('[data-modal-target="cfr-modal-form"]').forEach(btn => {
        btn.onclick = (e) => {
            if (addrGroup && addr && addrGroup.style.display !== 'none') {
                const v = addr.value.trim();
                
                // Проверяем валидность адреса
                const isValid = v.length >= 5 && /[а-яА-Я]/.test(v) && /\d/.test(v);
                
                if (!isValid) {
                    // Блокируем открытие попапа
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    // Добавляем класс ошибки
                    addrGroup.classList.add('_error');
                    
                    // Фокус на поле
                    addr.focus();
                    
                    return false;
                } else {
                    // Если валидно - убираем ошибку
                    addrGroup.classList.remove('_error');
                }
            }
            //setTimeout(updateAddressInModal, 50);
        };
    });
    
    // Обработчики для поля адреса (оставляем как было)
    if (addr) {
        addr.addEventListener('input', function() {
            addrGroup.classList.remove('_error');
        });
        
        addr.addEventListener('focus', function() {
            // Класс _error остаётся, но CSS покажет подсказку только при фокусе
        });
        
        addr.addEventListener('blur', function() {
            const v = this.value.trim();
            if (v && !(v.length >= 5 && /[а-яА-Яa-zA-Z]/.test(v) && /\d/.test(v))) {
                addrGroup.classList.add('_error');
            }
        });
    }
});

// Функция обновления адреса в попапе (нужно обновить проверку)
function updateAddressInModal() {
    const modal = document.getElementById('cfr-modal-form');
    if (!modal) return;
    
    const addressLabel = modal.querySelector('label.address');
    if (!addressLabel) return;
    
    const checkboxes = document.querySelectorAll('.js-g-measurer input[type="checkbox"]');
    const addr = document.querySelector('.js-g-address input[type="text"]');
    
    // Проверяем активен ли ХОТЯ БЫ ОДИН чекбокс
    const isAnyChecked = Array.from(checkboxes).some(cb => cb.checked);
    const addrValue = addr ? addr.value.trim() : '';
    
    // Обновляем или очищаем
    if (isAnyChecked) {
        addressLabel.innerHTML = `Адрес:<br><b style="margin-top: 1rem;">${addrValue}</b>`;
        addressLabel.style.display = 'block';
    } else {
        addressLabel.innerHTML = '';
        addressLabel.style.display = 'none';
    }
}
    
    

})(jQuery);