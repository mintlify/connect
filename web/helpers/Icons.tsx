import { DocumentTextIcon } from '@heroicons/react/outline'
import { AddDocumentationType } from '../components/commands/documentation/AddDocumentation'

export type AddDocumentTypeIconProps = {
  type: AddDocumentationType
  outerSize?: number
  innerSize?: number
  isActive?: boolean
}

export const DocumentationTypeIcon = ({ type, outerSize = 10, innerSize = 6, isActive = false }: AddDocumentTypeIconProps) => {
  switch (type) {
    case 'notion':
      return (
        <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
          <svg
            viewBox="13.38 3.2 485.44 505.7"
            className={`h-${innerSize} w-${innerSize}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m186.84 13.95c-79.06 5.85-146.27 11.23-149.43 11.86-8.86 1.58-16.92 7.59-20.71 15.5l-3.32 6.96.32 165.88.47 165.88 5.06 10.28c2.85 5.69 22.14 32.26 43.17 59.61 41.59 53.92 44.59 56.93 60.4 58.51 4.59.47 39.06-1.11 76.38-3.32 37.48-2.37 97.56-6.01 133.62-8.06 154.01-9.35 146.1-8.56 154.95-16.15 11.07-9.17 10.28 5.85 10.75-195.76.32-170.94.16-182.16-2.37-187.38-3-5.85-8.38-9.96-78.59-59.3-46.96-32.89-50.28-34.63-71.32-34.95-8.69-.31-80.48 4.43-159.38 10.44zm177.73 21.66c6.64 3 55.19 36.84 62.3 43.33 1.9 1.9 2.53 3.48 1.58 4.43-2.21 1.9-302.66 19.77-311.35 18.5-3.95-.63-9.8-3-13.12-5.22-13.76-9.33-47.91-37.32-47.91-39.37 0-5.38-1.11-5.38 132.83-15.02 25.62-1.74 67.68-4.9 93.3-6.96 55.49-4.43 72.1-4.27 82.37.31zm95.51 86.5c2.21 2.21 4.11 6.48 4.74 10.59.47 3.8.79 74.64.47 157.18-.47 141.68-.63 150.54-3.32 154.65-1.58 2.53-4.74 5.22-7.12 6.01-6.63 2.69-321.46 20.56-327.94 18.66-3-.79-7.12-3.32-9.33-5.53l-3.8-4.11-.47-152.75c-.32-107.21 0-154.65 1.27-158.92.95-3.16 3.32-6.96 5.38-8.22 2.85-1.9 21.51-3.48 85.71-7.27 45.07-2.53 114.8-6.8 154.81-9.17 95.17-5.86 94.86-5.86 99.6-1.12z"
              fill={isActive ? '#FFF' : '#000'}
            />
            <path
              d="m375.48 174.45c-17.08 1.11-32.26 2.69-34 3.64-5.22 2.69-8.38 7.12-9.01 12.18-.47 5.22 1.11 5.85 18.18 7.91l7.43.95v67.52c0 40.16-.63 66.73-1.42 65.94-.79-.95-23.24-35.1-49.97-75.9-26.72-40.95-48.86-74.64-49.18-74.95-.32-.32-17.71.63-38.58 2.06-25.62 1.74-39.69 3.32-42.54 4.9-4.59 2.37-9.65 10.75-9.65 16.29 0 3.32 6.01 5.06 18.66 5.06h6.64v194.18l-10.75 3.32c-8.38 2.53-11.23 4.11-12.65 7.27-2.53 5.38-2.37 10.28.16 10.28.95 0 18.82-1.11 39.37-2.37 40.64-2.37 45.22-3.48 49.49-11.86 1.27-2.53 2.37-5.22 2.37-6.01 0-.63-5.53-2.53-12.18-4.11-6.8-1.58-13.6-3.16-15.02-3.48-2.69-.79-2.85-5.69-2.85-73.69v-72.9l48.07 75.43c50.44 79.06 56.77 88.08 64.52 92.03 9.65 5.06 34.16 1.58 46.49-6.48l3.8-2.37.32-107.84.47-108 8.38-1.58c9.96-1.9 14.55-6.48 14.55-14.39 0-5.06-.32-5.38-5.06-5.22-2.83.13-19.12 1.08-36.04 2.19z"
              fill={isActive ? '#FFF' : '#000'}
            />
          </svg>
        </div>
      )
    case 'confluence':
      return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-${innerSize} w-${innerSize}`} viewBox="0 0 256 246" version="1.1" preserveAspectRatio="xMidYMid">
            <defs>
                <linearGradient x1="99.140087%" y1="112.708084%" x2="33.8589812%" y2="37.7549606%" id="linearGradient-1">
                    <stop stopColor={isActive ? '#FFF' : "#0052CC"} offset="18%"/>
                    <stop stopColor={isActive ? '#FFF' : "#2684FF"} offset="100%"/>
                </linearGradient>
                <linearGradient x1="0.92569163%" y1="-12.5823074%" x2="66.1800713%" y2="62.3057471%" id="linearGradient-2">
                    <stop stopColor={isActive ? '#FFF' : "#0052CC"} offset="18%"/>
                    <stop stopColor={isActive ? '#FFF' : "#2684FF"} offset="100%"/>
                </linearGradient>
            </defs>
            <g>
                <path d="M9.26054484,187.329971 C6.61939782,191.637072 3.65318655,196.634935 1.13393863,200.616972 C-1.12098385,204.42751 0.0895487945,209.341911 3.85635171,211.669157 L56.6792921,244.175582 C58.5334859,245.320393 60.7697695,245.67257 62.8860683,245.153045 C65.0023672,244.633521 66.8213536,243.285826 67.9346417,241.412536 C70.0475593,237.877462 72.7699724,233.285929 75.7361837,228.369333 C96.6621947,193.831256 117.710105,198.057091 155.661356,216.179423 L208.037333,241.087471 C210.020997,242.031639 212.302415,242.132457 214.361632,241.366949 C216.420848,240.601441 218.082405,239.034833 218.967618,237.024168 L244.119464,180.137925 C245.896483,176.075046 244.088336,171.3377 240.056161,169.492071 C229.003977,164.291043 207.021507,153.92962 187.233221,144.380857 C116.044151,109.802148 55.5415672,112.036965 9.26054484,187.329971 Z" fill="url(#linearGradient-1)"/>
                <path d="M246.11505,58.2319428 C248.756197,53.9248415 251.722408,48.9269787 254.241656,44.9449416 C256.496579,41.1344037 255.286046,36.2200025 251.519243,33.8927572 L198.696303,1.38633231 C196.82698,0.127283893 194.518741,-0.298915762 192.323058,0.209558312 C190.127374,0.718032386 188.241461,2.11550922 187.115889,4.06811236 C185.002971,7.60318607 182.280558,12.1947186 179.314347,17.1113153 C158.388336,51.6493918 137.340426,47.4235565 99.3891748,29.3012247 L47.1757299,4.5150757 C45.1920661,3.57090828 42.9106475,3.47008979 40.8514312,4.2355977 C38.7922149,5.00110562 37.1306578,6.56771434 36.2454445,8.57837881 L11.0935983,65.4646223 C9.31657942,69.5275012 11.1247267,74.2648471 15.1569014,76.1104765 C26.2090859,81.3115044 48.1915557,91.6729274 67.9798418,101.22169 C139.331444,135.759766 199.834028,133.443683 246.11505,58.2319428 Z" fill="url(#linearGradient-2)"/>
            </g>
        </svg>
      </div>
    case 'google':
      return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
        <img className={`h-${innerSize} w-${innerSize} flex items-center justify-center`} src="assets/integrations/google-docs.svg" alt="Google Docs" />
      </div>
    case 'github':
      return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
      <img className={`h-${innerSize} w-${innerSize} flex items-center justify-center`} src="assets/integrations/github.svg" alt="Google Docs" />
    </div>
  case 'webpage':
    return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`h-${innerSize} w-${innerSize} flex items-center justify-center text-slate-600`} fill="currentColor">
        <path d="M172.5 131.1C228.1 75.51 320.5 75.51 376.1 131.1C426.1 181.1 433.5 260.8 392.4 318.3L391.3 319.9C381 334.2 361 337.6 346.7 327.3C332.3 317 328.9 297 339.2 282.7L340.3 281.1C363.2 249 359.6 205.1 331.7 177.2C300.3 145.8 249.2 145.8 217.7 177.2L105.5 289.5C73.99 320.1 73.99 372 105.5 403.5C133.3 431.4 177.3 435 209.3 412.1L210.9 410.1C225.3 400.7 245.3 404 255.5 418.4C265.8 432.8 262.5 452.8 248.1 463.1L246.5 464.2C188.1 505.3 110.2 498.7 60.21 448.8C3.741 392.3 3.741 300.7 60.21 244.3L172.5 131.1zM467.5 380C411 436.5 319.5 436.5 263 380C213 330 206.5 251.2 247.6 193.7L248.7 192.1C258.1 177.8 278.1 174.4 293.3 184.7C307.7 194.1 311.1 214.1 300.8 229.3L299.7 230.9C276.8 262.1 280.4 306.9 308.3 334.8C339.7 366.2 390.8 366.2 422.3 334.8L534.5 222.5C566 191 566 139.1 534.5 108.5C506.7 80.63 462.7 76.99 430.7 99.9L429.1 101C414.7 111.3 394.7 107.1 384.5 93.58C374.2 79.2 377.5 59.21 391.9 48.94L393.5 47.82C451 6.731 529.8 13.25 579.8 63.24C636.3 119.7 636.3 211.3 579.8 267.7L467.5 380z"/>
      </svg>
  </div>
    default:
      return null
  }
}

export const ConfluencePageIcon = ({className}: { className: string }) => {
  return <svg className={className} viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2.27879 48.1012C1.62879 49.1612 0.898794 50.3912 0.278794 51.3712C0.0120266 51.8221 -0.0672323 52.3595 0.0580524 52.8681C0.183337 53.3768 0.503164 53.8159 0.948794 54.0912L13.9488 62.0912C14.1747 62.2307 14.4261 62.3238 14.6884 62.3651C14.9506 62.4064 15.2185 62.3951 15.4763 62.3318C15.7341 62.2685 15.9768 62.1545 16.1901 61.9965C16.4034 61.8384 16.5832 61.6395 16.7188 61.4112C17.2388 60.5412 17.9088 59.4113 18.6388 58.2013C23.7888 49.7013 28.9688 50.7413 38.3088 55.2013L51.1988 61.3312C51.4404 61.4463 51.7027 61.5116 51.97 61.5234C52.2374 61.5352 52.5044 61.4933 52.7552 61.4C53.0061 61.3068 53.2357 61.1641 53.4304 60.9806C53.6251 60.797 53.781 60.5762 53.8888 60.3312L60.0788 46.3312C60.289 45.8506 60.302 45.3067 60.1149 44.8166C59.9279 44.3265 59.5558 43.9296 59.0788 43.7112C56.3588 42.4312 50.9488 39.8812 46.0788 37.5312C28.5588 29.0212 13.6688 29.5712 2.27879 48.1012Z" fill="url(#paint0_linear_612_19)"/>
  <path d="M60.5689 16.3312C61.2189 15.2712 61.9489 14.0412 62.5689 13.0612C62.8357 12.6104 62.9149 12.0729 62.7896 11.5643C62.6643 11.0557 62.3445 10.6165 61.8989 10.3412L48.8989 2.34117C48.6713 2.18789 48.4146 2.08307 48.1448 2.03325C47.8749 1.98342 47.5977 1.98966 47.3304 2.05156C47.0631 2.11347 46.8113 2.22972 46.5909 2.39309C46.3704 2.55646 46.1859 2.76345 46.0489 3.00117C45.5289 3.87117 44.8589 5.00117 44.1289 6.21117C38.9789 14.7112 33.7989 13.6712 24.4589 9.21117L11.6089 3.11117C11.3672 2.99616 11.105 2.93081 10.8376 2.919C10.5703 2.90718 10.3033 2.94914 10.0524 3.04239C9.8016 3.13564 9.57203 3.27828 9.37731 3.46187C9.1826 3.64545 9.02671 3.86625 8.91888 4.11117L2.72888 18.1112C2.51868 18.5918 2.5057 19.1357 2.69276 19.6258C2.87981 20.1159 3.25191 20.5129 3.72888 20.7312C6.44888 22.0112 11.8589 24.5612 16.7289 26.9112C34.2889 35.4112 49.1789 34.8412 60.5689 16.3312Z" fill="url(#paint1_linear_612_19)"/>
  <defs>
  <linearGradient id="paint0_linear_612_19" x1="59.7288" y1="66.2212" x2="20.3988" y2="43.6213" gradientUnits="userSpaceOnUse">
  <stop offset="0.18" stopColor="#0052CC"/>
  <stop offset="1" stopColor="#2684FF"/>
  </linearGradient>
  <linearGradient id="paint1_linear_612_19" x1="3.11888" y1="-1.79883" x2="42.4589" y2="20.8112" gradientUnits="userSpaceOnUse">
  <stop offset="0.18" stopColor="#0052CC"/>
  <stop offset="1" stopColor="#2684FF"/>
  </linearGradient>
  </defs>
  </svg>  
}

export const SilencedDocIcon = ({ outerSize = 10, innerSize = 6 }: { outerSize?: number, innerSize?: number }) => {
  return <div className={`h-${outerSize} w-${outerSize} rounded-lg bg-red-100 flex items-center justify-center`}>
    <svg className={`h-${innerSize - 1} w-${innerSize- 1}`} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12.088 11.0051C12.2162 10.9601 12.327 10.8779 12.4055 10.7696C12.4839 10.6614 12.5262 10.5323 12.5266 10.4V9.75C12.5267 9.66463 12.5094 9.58007 12.4758 9.5012C12.4421 9.42233 12.3927 9.35071 12.3304 9.29045L11.1873 8.1809V5.2C11.1873 3.10895 9.72422 1.34745 7.74214 0.8177C7.54595 0.338 7.0665 0 6.5 0C5.9335 0 5.45405 0.338 5.25785 0.8177C4.37195 1.0543 3.60858 1.5509 3.01731 2.20025L0.946842 0.19045L0 1.10955L12.0532 12.8095L13 11.8904L12.088 11.0051ZM6.5 13C6.91469 13.0005 7.31925 12.8756 7.65743 12.6426C7.99561 12.4096 8.25061 12.0802 8.38699 11.7H4.61301C4.74939 12.0802 5.00439 12.4096 5.34257 12.6426C5.68075 12.8756 6.0853 13.0005 6.5 13ZM1.81266 5.2V8.1809L0.66962 9.29045C0.607317 9.35071 0.557907 9.42233 0.524235 9.5012C0.490563 9.58007 0.473294 9.66463 0.473421 9.75V10.4C0.473421 10.5724 0.54397 10.7377 0.669548 10.8596C0.795126 10.9815 0.965447 11.05 1.14304 11.05H8.42783L1.85819 4.67285C1.83744 4.84705 1.81266 5.0206 1.81266 5.2Z" fill="#AB1212"/></svg>
  </div>
}

export const ConnectionIcon = ({ outerSize = 10, innerSize = 6 }: { outerSize?: number; innerSize?: number }) => {
  return (
    <div className={`h-${outerSize} aspect-square rounded-lg bg-green-100 flex items-center justify-center`}>
      <svg
        className={`h-${innerSize - 1} text-green-700`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 512"
        fill="currentColor"
      >
        <path d="M0 256C0 167.6 71.63 96 160 96H256C273.7 96 288 110.3 288 128C288 145.7 273.7 160 256 160H160C106.1 160 64 202.1 64 256C64 309 106.1 352 160 352H256C273.7 352 288 366.3 288 384C288 401.7 273.7 416 256 416H160C71.63 416 0 344.4 0 256zM480 416H384C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352H480C533 352 576 309 576 256C576 202.1 533 160 480 160H384C366.3 160 352 145.7 352 128C352 110.3 366.3 96 384 96H480C568.4 96 640 167.6 640 256C640 344.4 568.4 416 480 416zM416 224C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H224C206.3 288 192 273.7 192 256C192 238.3 206.3 224 224 224H416z"/>
      </svg>
    </div>
  )
}

export const DocTitleIcon = ({ favicon, method }: { favicon?: string, method: string }) => {
  if (method === 'notion-private') {
    return <img src="/assets/integrations/notion.svg" alt="favicon" className="h-5 w-5 rounded-sm" />;
  }

  if (method === 'googledocs-private') {
    return <img src="/assets/integrations/google-docs.svg" alt="favicon" className="h-5 w-5 rounded-sm" />;
  }

  if (method === 'confluence-private') {
    return <ConfluencePageIcon className="h-5 w-5 rounded-sm" />;
  }

  if (method === 'github') {
    return <img src="/assets/integrations/github.svg" alt="favicon" className="h-5 w-5 rounded-sm" />;
  }

  if (favicon) {
    return <img src={favicon} alt="favicon" className="h-5 w-5 aspect-square rounded-sm" />
  }

  if (method === 'web') {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`h-5 w-5 flex items-center justify-center text-slate-600`} fill="currentColor">
    <path d="M172.5 131.1C228.1 75.51 320.5 75.51 376.1 131.1C426.1 181.1 433.5 260.8 392.4 318.3L391.3 319.9C381 334.2 361 337.6 346.7 327.3C332.3 317 328.9 297 339.2 282.7L340.3 281.1C363.2 249 359.6 205.1 331.7 177.2C300.3 145.8 249.2 145.8 217.7 177.2L105.5 289.5C73.99 320.1 73.99 372 105.5 403.5C133.3 431.4 177.3 435 209.3 412.1L210.9 410.1C225.3 400.7 245.3 404 255.5 418.4C265.8 432.8 262.5 452.8 248.1 463.1L246.5 464.2C188.1 505.3 110.2 498.7 60.21 448.8C3.741 392.3 3.741 300.7 60.21 244.3L172.5 131.1zM467.5 380C411 436.5 319.5 436.5 263 380C213 330 206.5 251.2 247.6 193.7L248.7 192.1C258.1 177.8 278.1 174.4 293.3 184.7C307.7 194.1 311.1 214.1 300.8 229.3L299.7 230.9C276.8 262.1 280.4 306.9 308.3 334.8C339.7 366.2 390.8 366.2 422.3 334.8L534.5 222.5C566 191 566 139.1 534.5 108.5C506.7 80.63 462.7 76.99 430.7 99.9L429.1 101C414.7 111.3 394.7 107.1 384.5 93.58C374.2 79.2 377.5 59.21 391.9 48.94L393.5 47.82C451 6.731 529.8 13.25 579.8 63.24C636.3 119.7 636.3 211.3 579.8 267.7L467.5 380z"/>
  </svg>
  }

  return  <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
}
