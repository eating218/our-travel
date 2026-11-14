import type { CSSProperties } from "react";

/** 裝飾用：DAY 2 東山 / DAY 3 嵐山。不改動任何行程或導航資料。 */
export default function KyotoScenery({
  day = 2,
  compact = false,
  style,
}: {
  day?: number;
  compact?: boolean;
  style?: CSSProperties;
}) {
  const arashiyama = day === 3;
  return (
    <svg aria-hidden="true" viewBox="0 0 390 120" preserveAspectRatio="xMidYMax slice" style={style} className="pointer-events-none block h-full w-full" fill="none">
      <defs>
        <linearGradient id="kyoto-refined-glow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#40668C" stopOpacity="0" />
          <stop offset="1" stopColor="#40668C" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id="kyoto-refined-roof" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#7B9FB9" /><stop offset="1" stopColor="#274A64" />
        </linearGradient>
      </defs>
      <path d="M0 0H390V120H0Z" fill="url(#kyoto-refined-glow)" />
      {/* 左下青海波，故意低調，避免搶走標題 */}
      {Array.from({length: 6}, (_,i) => i * 17).map(x => (
        <g key={x} stroke="#6C9CC5" opacity=".58" strokeWidth="1.5">
          <path d={`M${x-18} 117a19 19 0 0 1 38 0`}/>
          <path d={`M${x-12} 117a13 13 0 0 1 26 0`}/>
          <path d={`M${x-6} 117a7 7 0 0 1 14 0`}/>
        </g>
      ))}
      {/* 雲、飄落的花瓣 */}
      <g fill="#B9D7EB" opacity=".9">
        <path d="M122 86q4-9 13-7 6-14 17-6 9-2 13 9h8v6h-51z" />
        <path d="M230 26q4-9 13-7 6-13 17-5 9-2 13 9h8v6h-51z" />
        <path d="M340 43q3-7 10-5 5-10 13-4 7-2 10 6h5v5h-38z" />
      </g>
      {[[190,29],[218,48],[290,11],[328,23],[370,62],[155,62]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="3.5" ry="2.2" transform={`rotate(-37 ${x} ${y})`} fill="#FFB7C9" stroke="#FFDCE6" strokeWidth=".6" />
      ))}
      {arashiyama ? (
        <>
          {/* 嵐山：山脈、保津川、渡月橋、竹林 */}
          <path d="M165 114 224 43 258 78 297 30 366 114Z" fill="#7FA8A8" />
          <path d="M165 114 224 57 259 90 297 49 366 114Z" fill="#A4C9B5" />
          <path d="M151 111q72-13 126-3t113-2v14H151Z" fill="#70B8D1" />
          <path d="M166 102Q263 80 355 101" stroke="#F3DEB7" strokeWidth="6" strokeLinecap="round" />
          <path d="M165 104Q263 82 355 103" stroke="#8B604C" strokeWidth="1.5" />
          {[183,205,227,249,271,293,315,337].map(x=><path key={x} d={`M${x} 99v15`} stroke="#896D52" strokeWidth="2.2" />)}
          <path d="M164 112h191" stroke="#E7D5B4" strokeWidth="3" />
          {[335,352,370,387].map((x,i)=>(
            <g key={x}>
              <path d={`M${x} 120V${15+i%2*11}`} stroke="#5C9D7A" strokeWidth="4" />
              {[29,49,69,89].map(y=><g key={y} stroke="#A4D7A3" strokeWidth="2" strokeLinecap="round"><path d={`M${x} ${y}q-12-11-19-7`}/><path d={`M${x} ${y+3}q11-12 20-9`}/></g>)}
            </g>
          ))}
          <path d="M120 118q11-16 23-7 10-15 23-2 12-10 22 9Z" fill="#9ED48B" />
        </>
      ) : (
        <>
          {/* 東山：精細八坂塔，前後屋簷與窗戶 */}
          <g transform="translate(222 10)">
            <path d="M17 108V33H65V108Z" fill="#F8E8CD" stroke="#8D5B43" strokeWidth="1.6" />
            {[39,61,83].map((y,i)=>(
              <g key={y}>
                <rect x="22" y={y+1} width="38" height="18" fill="#E98758" stroke="#8B4D39" strokeWidth="1.1" />
                {[27,39,51].map(x=><rect key={x} x={x} y={y+5} width="8" height="10" fill="#FFF2BE" stroke="#C76C4C" strokeWidth=".6" />)}
                <path d={`M8 ${y+1} 41 ${y-13} 74 ${y+1} 66 ${y+7} 41 ${y-2} 16 ${y+7}Z`} fill="url(#kyoto-refined-roof)" stroke="#B77D59" strokeWidth="2" strokeLinejoin="round" />
                <path d={`M12 ${y+1}Q41 ${y-10} 70 ${y+1}`} stroke="#B9D5E5" strokeWidth="1.4" />
              </g>
            ))}
            <path d="M41 25V7" stroke="#F6D27A" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="41" cy="5" r="2.3" fill="#F6D27A" />
            <path d="M34 108V94h14v14" fill="#9B5E45" />
          </g>
          {/* 町家，屋頂層次、窗格、燈籠 */}
          {[{x:291,w:52,h:42},{x:339,w:58,h:49}].map(({x,w,h},i)=>(
            <g key={x}>
              <rect x={x} y={118-h} width={w} height={h} fill={i ? "#EFD5B7":"#F6E6D0"} stroke="#8A624D" strokeWidth="1.6" />
              <path d={`M${x-6} ${118-h}L${x+w/2} ${106-h}L${x+w+6} ${118-h}L${x+w} ${124-h}H${x}Z`} fill="url(#kyoto-refined-roof)" stroke="#A97961" strokeWidth="2" />
              <path d={`M${x+7} ${117-h/2}v${h/2-1}h${w-14}v${-h/2+1}`} stroke="#9C745A" strokeWidth="1.6" />
              {[x+13,x+25,x+37].map(xx=><rect key={xx} x={xx} y={119-h+13} width="7" height="10" fill="#FFE7A7" stroke="#B78765" strokeWidth=".6" />)}
              <rect x={x+7} y={118-h+25} width="12" height={h-25} fill="#A36E56" />
            </g>
          ))}
          {/* 樹木與花朵，分層花瓣 */}
          {[{x:194,y:112,s:.72},{x:365,y:116,s:.58}].map(({x,y,s},i)=>(
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <path d="M0 0V-42m0 19-19-18m19 9 17-22" stroke="#8A5D4E" strokeWidth="5" strokeLinecap="round" />
              {[[-18,-44],[-4,-57],[15,-51],[-29,-30],[25,-33],[1,-37]].map(([cx,cy],j)=>(
                <g key={j}>
                  {[0,72,144,216,288].map(a=><ellipse key={a} cx={cx} cy={cy-8} rx="7" ry="10" transform={`rotate(${a} ${cx} ${cy})`} fill="#F8BACB" stroke="#E88FA9" strokeWidth="1.1" />)}
                  <circle cx={cx} cy={cy} r="4.2" fill="#FFE7A8" />
                </g>
              ))}
            </g>
          ))}
          <path d="M171 118q6-14 17-8 9-16 21-5 11-9 20 13m57 0q7-14 18-8 11-12 23 8" fill="#9ED58B" stroke="#79B66C" strokeWidth="1.5" />
        </>
      )}
      {!compact && <path d="M0 119H390" stroke="#B3D99B" strokeWidth="2.5" />}
    </svg>
  );
}
