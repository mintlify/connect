import Layout from "../components/layout";
import { BellIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/outline'
import { GetServerSideProps } from "next";
import { withSession } from "../lib/withSession";
import { UserSession } from ".";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { API_ENDPOINT } from "../helpers/api";

const navigation = [
  { name: 'Account', href: '#', icon: UserCircleIcon },
  { name: 'Organization', href: '#', icon: UserGroupIcon },
  { name: 'Notifications', href: '#', icon: BellIcon },
]

const people = [
  {
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    department: 'Optimization',
    email: 'lindsay.walton@example.com',
    role: 'Member',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  // More people...
]

export default function Settings({ userSession }: { userSession: UserSession }) {
  const user = userSession.user;
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [orgName, setOrgName] = useState(user.org.name);

  const onBlurFirstNameInput = () => {
    if (firstName !== user.firstName) {
      axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/firstname`, {
        firstName,
      });
    }
  }

  const onBlurLastNameInput = () => {
    if (lastName !== user.lastName) {
      axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/lastname`, {
        lastName,
      });
    }
  }

  const onBlurOrgNameInput = () => {
    if (orgName !== user.org.name) {
      axios.put(`${API_ENDPOINT}/routes/org/${user.org._id}/name?userId=${user.userId}`, {
        name: orgName,
      });
    }
  }

  return (
    <Layout user={userSession.user}>
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
    <div className="my-6 lg:grid lg:grid-cols-12 lg:gap-x-5">
      <aside className="py-0 px-2 sm:px-6 lg:px-0 lg:col-span-4">
        <nav className="space-y-1 lg:ml-40">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-700 hover:text-gray-800 hover:bg-white group rounded-md px-3 py-2 flex items-center text-sm font-medium"
            >
              <item.icon
                className="text-primary group-hover:text-primary flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="space-y-8 sm:px-6 lg:px-0 lg:col-span-5">
      <form action="#" method="POST">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="bg-white pt-6 pb-8 px-4 space-y-5 sm:px-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Account</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your personal account information
                </p>
              </div>

              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    autoComplete="given-name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={onBlurFirstNameInput}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    autoComplete="family-name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={onBlurLastNameInput}
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="text"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    disabled
                    value={userSession.user.email}
                    className="mt-1 block w-full border border-gray-300 bg-gray-100 text-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="text-sm mt-2 text-gray-500">
                    <Link href="mailto:hi@mintlify.com">
                      <span className="text-primary font-medium cursor-pointer">
                        Contact support
                      </span>
                    </Link>
                    {' '}to change your primary email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <form action="#" method="POST">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="bg-white pt-6 pb-8 px-4 space-y-5 sm:px-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Organization</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Settings for your organization and team members
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3">
                  <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 rounded-md shadow-sm flex">
                    <input
                      type="text"
                      name="organization"
                      id="organization"
                      autoComplete="organization"
                      className="focus:ring-indigo-500 focus:border-indigo-500 flex-grow block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      onBlur={onBlurOrgNameInput}
                    />
                  </div>
                </div>

                <div className="col-span-3">
                <div>
                  <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                      <h1 className="text-lg leading-6 font-medium text-gray-900">Members</h1>
                      <p className="mt-2 text-sm text-gray-500">
                        Manage members of your organization here
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hover focus:outline-none focus:ring-0 focus:ring-offset-2 sm:w-auto"
                      >
                        Add member
                      </button>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                  Name
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Role
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                  <span className="sr-only">Edit</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {people.map((person) => (
                                <tr key={person.email}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                    <div className="flex items-center">
                                      <div className="h-10 w-10 flex-shrink-0">
                                        <img className="h-10 w-10 rounded-full" src={person.image} alt="" />
                                      </div>
                                      <div className="ml-4">
                                        <div className="font-medium text-gray-900">{person.name}</div>
                                        <div className="text-gray-500">{person.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>
                                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-primary hover:text-hover">
                                      Edit<span className="sr-only">, {person.name}</span>
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <form action="#" method="POST">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="bg-white pt-6 pb-8 px-4 space-y-5 sm:px-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage notification preferences
                </p>
              </div>

              <fieldset>
                <legend className="text-base font-medium text-gray-900">Email notifications</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="h-5 flex items-center">
                      <input
                        id="comments"
                        name="comments"
                        type="checkbox"
                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="comments" className="font-medium text-gray-700">
                        Monthly documentation digest
                      </label>
                      <p className="text-gray-500">Get a detailed report on the monthly documentation changes</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="h-5 flex items-center">
                        <input
                          id="candidates"
                          name="candidates"
                          type="checkbox"
                          className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="candidates" className="font-medium text-gray-700">
                          Newsletter
                        </label>
                        <p className="text-gray-500">Be notified on product updates and special offers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </form>
      </div>
    </div>
    </div>
    </Layout>
  )
};

const getServerSidePropsHandler: GetServerSideProps = async ({req}: any) => {
  const userSession = req.session.get('user') ?? null;
  const props = {userSession};
  return {props};
}

export const getServerSideProps = withSession(getServerSidePropsHandler);