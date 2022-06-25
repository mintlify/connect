import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { API_ENDPOINT } from "../../../helpers/api"
import { classNames } from "../../../helpers/functions"
import { request } from "../../../helpers/request"

export const isUrlValid = (str: string): boolean => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i"
  )
  return pattern.test(str);
}

type AddWebpageProps = {
  onClose: () => void,
  onBack: () => void,
}

export default function AddWebpage({onClose, onBack}: AddWebpageProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favicon, setFavicon] = useState();

  useEffect(() => {
    if (!isUrlValid(url)) {
      setIsLoading(false);
      setFavicon(undefined);
      return;
    }

    setIsLoading(true);
    axios.get(`${API_ENDPOINT}/routes/docs/preview`, {
      params: {
        url
      }
    }).then(({ data }) => {
      setIsLoading(false);
      const { favicon } = data;
      setFavicon(favicon);
    })
  }, [url]);

  const onSubmit = async () => {
    await request('POST', 'routes/docs/webpage', { url });
    onBack();
  }

  const isValidToSubmit = Boolean(url);

  return <div>
    <div className="mt-1">
      <div className="mt-1 relative flex rounded-md shadow-sm">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
          {
            isLoading && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 animate-spin" viewBox="0 0 512 512" fill="currentColor">
            <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z"/>
          </svg>
          }
          {
            !isLoading && favicon ? <Link href={url}>
              <a target="_blank">
                <img className="h-4 w-4 cursor-pointer rounded-sm" src={favicon} alt="Favicon of result" />
              </a>
            </Link> : 'https://'
          }
        </span>
        <input
          type="text"
          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-0 focus:border-gray-300 sm:text-sm border-gray-300"
          placeholder="example.com"
        />
      </div>
  </div>
  <div className="flex items-center">
  <div>
    <p className="text-xs text-gray-400 mt-1">Content will not be scraped</p>
  </div>
  <div className="flex-1 mt-4 flex justify-end">
    <button
      type="button"
      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
      onClick={onBack}
    >
      Back
    </button>
    <button
      type="submit"
      disabled={!isValidToSubmit}
      className={classNames("ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
      isValidToSubmit ? "bg-primary hover:bg-hover" : "bg-gray-300 cursor-default")}
      onClick={onSubmit}
    >
      Add Documentation
    </button>
  </div>
  </div>
</div>
}