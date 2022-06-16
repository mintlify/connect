import { SearchIcon } from '@heroicons/react/outline'
import { CheckCircleIcon } from '@heroicons/react/solid'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useProfile } from '../../../context/ProfileContex'
import { API_ENDPOINT } from '../../../helpers/api'
import { classNames } from '../../../helpers/functions'
import { getSubdomain } from '../../../helpers/user'
import timeAgo from '../../../services/timeago'

type GoogleDoc = {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
}

type AddNotionProps = {
  onCancel: () => void
  setIsAddDocumentationOpen: (isOpen: boolean) => void
  setIsAddDocLoading: (isAddingAutomation: boolean) => void
}

export default function AddGoogleDocs({ onCancel, setIsAddDocumentationOpen, setIsAddDocLoading }: AddNotionProps) {
  const { profile } = useProfile();
  const [docs, setDocs] = useState<GoogleDoc[]>()
  const [selectedDocs, setSelectedDocs] = useState<GoogleDoc[]>([])
  const [search, setSearch] = useState('')
  const router = useRouter()

  const { user, org } = profile;

  useEffect(() => {
    if (user == null || org == null) {
      return;
    }
    axios
      .post(
        `${API_ENDPOINT}/routes/integrations/google/sync`,
        null,
        {
          params: {
            userId: user.userId,
            subdomain: getSubdomain(window.location.host),
          },
        }
      )
      .then(({ data: { results } }) => {
        setDocs(results);
        setSelectedDocs(results);
      })
      .catch(async () => {
        router.push(`${API_ENDPOINT}/routes/integrations/google/install?org=${org._id}`)
      })
  }, [user, org, router])

  if (user == null || org == null) {
    return null;
  }

  const onClickPage = (selectingDoc: GoogleDoc) => {
    if (selectedDocs.some((doc) => doc.id === selectingDoc.id)) {
      setSelectedDocs(selectedDocs.filter((doc) => doc.id !== selectingDoc.id))
    } else {
      setSelectedDocs([...selectedDocs, selectingDoc])
    }
  }

  const filteredDocs =
    docs?.filter((doc) => {
      return doc.name.toLowerCase().includes(search.toLowerCase())
    }) || []

  const isValidToSubmit = selectedDocs.length > 0

  const onSubmit = async () => {
    setIsAddDocLoading(true)
    axios
      .post(
        `${API_ENDPOINT}/routes/docs/googledocs`,
        {
          docs: selectedDocs,
        },
        {
          params: {
            userId: user.userId,
            subdomain: getSubdomain(window.location.host),
          },
        }
      )
      .then(() => {
        setIsAddDocLoading(false)
      })
    setIsAddDocumentationOpen(false)
  }

  return (
    <div>
      {docs != null && selectedDocs != null ? (
        <>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              name="search"
              id="search"
              className="focus:ring-0 focus:border-gray-300 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4">
            {filteredDocs?.map((doc) => (
              <div
                key={doc.id}
                className={classNames(
                  selectedDocs.some((selectedDoc) => selectedDoc.id === doc.id) ? 'border-primary ring-1 ring-primary' : '',
                  'relative bg-white hover:bg-gray-50 border rounded-lg shadow-sm py-3 px-4 flex cursor-pointer focus:outline-none'
                )}
                onClick={() => onClickPage(doc)}
              >
                <span className="flex-1 flex">
                  <span className="flex flex-col">
                    <span className="flex items-center text-sm font-medium text-gray-900">
                      <img className="mr-1 w-4 h-4" src="assets/integrations/google-docs.svg" alt={doc.name} />
                      {doc.name}
                    </span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">Last updated {timeAgo.format(Date.parse(doc.modifiedTime))}</span>
                  </span>
                </span>
                <CheckCircleIcon
                  className={classNames(
                    selectedDocs.some((selectedDoc) => selectedDoc.id === doc.id) ? '' : 'invisible',
                    'h-5 w-5 text-primary'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    selectedDocs.some((selectedDoc) => selectedDoc.id === doc.id)
                      ? 'border-indigo-500'
                      : 'border-transparent',
                    'absolute -inset-px rounded-lg pointer-events-none'
                  )}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 animate-spin"
            viewBox="0 0 512 512"
            fill="currentColor"
          >
            <path d="M304 48C304 74.51 282.5 96 256 96C229.5 96 208 74.51 208 48C208 21.49 229.5 0 256 0C282.5 0 304 21.49 304 48zM304 464C304 490.5 282.5 512 256 512C229.5 512 208 490.5 208 464C208 437.5 229.5 416 256 416C282.5 416 304 437.5 304 464zM0 256C0 229.5 21.49 208 48 208C74.51 208 96 229.5 96 256C96 282.5 74.51 304 48 304C21.49 304 0 282.5 0 256zM512 256C512 282.5 490.5 304 464 304C437.5 304 416 282.5 416 256C416 229.5 437.5 208 464 208C490.5 208 512 229.5 512 256zM74.98 437C56.23 418.3 56.23 387.9 74.98 369.1C93.73 350.4 124.1 350.4 142.9 369.1C161.6 387.9 161.6 418.3 142.9 437C124.1 455.8 93.73 455.8 74.98 437V437zM142.9 142.9C124.1 161.6 93.73 161.6 74.98 142.9C56.24 124.1 56.24 93.73 74.98 74.98C93.73 56.23 124.1 56.23 142.9 74.98C161.6 93.73 161.6 124.1 142.9 142.9zM369.1 369.1C387.9 350.4 418.3 350.4 437 369.1C455.8 387.9 455.8 418.3 437 437C418.3 455.8 387.9 455.8 369.1 437C350.4 418.3 350.4 387.9 369.1 369.1V369.1z" />
          </svg>
        </div>
      )}
      <div className="flex">
        {docs && selectedDocs.length > 0 ? (
          <>
            <button className="text-sm text-primary font-medium" onClick={() => setSelectedDocs([])}>
              Deselect all
            </button>
          </>
        ) : docs ? (
          <button className="text-sm text-primary font-medium" onClick={() => setSelectedDocs(filteredDocs)}>
            Select all
          </button>
        ) : null}
        <div className="flex-1 mt-4 flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValidToSubmit}
            className={classNames(
              'ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
              isValidToSubmit ? 'bg-primary hover:bg-hover' : 'bg-gray-300 cursor-default'
            )}
            onClick={onSubmit}
          >
            Import ({selectedDocs.length}) Google Docs
          </button>
        </div>
      </div>
    </div>
  )
}