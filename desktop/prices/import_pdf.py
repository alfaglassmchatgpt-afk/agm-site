"""Import the bordered ALFAGLASS PDF layout; private output stays outside Git."""
import argparse, json, re, hashlib
from pathlib import Path
import pymupdf
from decimal import Decimal
ap=argparse.ArgumentParser();ap.add_argument('pdf');ap.add_argument('output');args=ap.parse_args()
doc=pymupdf.open(args.pdf);items=[];group='';seen=set()
for page_no,page in enumerate(doc,1):
    words=page.get_text('words')
    # All row boundaries touch the first column; retain multiline product names.
    ys=sorted(set(round(d['rect'].y0,2) for d in page.get_drawings() if d['rect'].height<2 and d['rect'].x0<33 and d['rect'].x1>53))
    for top,bottom in zip(ys,ys[1:]):
        band=[w for w in words if top<= (w[1]+w[3])/2 <bottom]
        def cell(left,right):
            return ' '.join(w[4] for w in sorted(band,key=lambda w:(round(w[1],1),w[0])) if left<=w[0]<right).strip()
        num=cell(31,54);code=cell(54,79.5);name=cell(79.5,419);unit=cell(419,446);amount=cell(446,490)
        if not num.isdigit() or not code.isdigit():
            label=' '.join(w[4] for w in sorted(band,key=lambda w:(round(w[1],1),w[0])))
            if label.startswith(('Материалы /','Услуги /')):group=label
            continue
        n=int(num);assert n not in seen,(page_no,n);seen.add(n)
        price=int(Decimal(amount.replace(' ',''))*100) if amount else None
        disabled=bool(re.search('не использовать|снят с производства|МАРКЕР',name,re.I)) or code=='5252'
        thick=re.search(r'(\d+)\s*мм',name) if group.startswith('Материалы') else None
        items.append(dict(code=code,name=name,group=group,kind='material' if group.startswith('Материалы') else 'rule' if 'коэффициенты' in group else 'service',unit=unit,priceKopecks=price,thicknessMm=int(thick[1]) if thick else None,enabled=not disabled,review=('Исключено из расчёта' if disabled else 'Нет числовой ставки; уточнить правило' if price is None else 'Уточнить наличие' if 'уточн' in name else ''),catalogId='',sourcePage=page_no,sourceRow=n))
assert seen==set(range(1,321)),sorted(set(range(1,321))-seen)
assert len({i['code'] for i in items})==len(items)
data=dict(schemaVersion=1,title='Прайс стекла и обработки',effectiveDate='2026-11-24',currency='RUB',vat='unconfirmed',status='draft',sourceSha256=hashlib.sha256(Path(args.pdf).read_bytes()).hexdigest(),rulesNote='Подтвердить НДС, базу коэффициентов, минимальную площадь и правила округления. Прайс ещё не подключён к расчётам.',items=items)
Path(args.output).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'rows':len(items),'materials':sum(i['kind']=='material' for i in items),'missingPrices':sum(i['priceKopecks'] is None for i in items),'disabled':sum(not i['enabled'] for i in items)}))
