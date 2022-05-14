import { UserAddIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Setup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');

  const onSubmit = () => {
    router.push({
      pathname: '/api/create',
      query: {
        email: 'han@mintlify.com',
        firstName,
        lastName,
        orgName,
      }
  });
  }

  return (
    <>
      <div className="min-h-screen flex items-center bg-gray-50 justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="/assets/mintlify.svg"
              alt="Mintlify"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Signed in with{' '}
              <a href="#" className="font-medium text-primary hover:text-hover">
                han@mintlify.com
              </a>
            </p>
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="fname"
                  id="fname"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                  placeholder="Richard"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="lname"
                  id="lname"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                  placeholder="Hendricks"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            </div>
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Organization
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="organization"
                  id="organization"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                  placeholder="Pied Piper"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={onSubmit}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserAddIcon className="h-5 w-5 text-secondary group-hover:text-primary" aria-hidden="true" />
              </span>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </>
  )
}