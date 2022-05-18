import { GetServerSideProps, NextPage } from "next";
import Sidebar from "../components/Sidebar";
import { classNames } from "../helpers/functions";
import Layout from "../components/layout";
import { getAutomationTypeIcon, getTypeIcon } from "../helpers/Icons";
import { Switch } from "@headlessui/react";
import Head from "next/head";
import { withSession } from "../lib/withSession";
import { UserSession } from ".";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { API_ENDPOINT } from "../helpers/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export type DestinationType = 'slack' | 'email' | 'webhook';
export type AutomationType = 'doc' | 'code';

export type Automation = {
  _id: string;
  org: string,
  type: AutomationType,
  source: {
    doc?: string, // used for doc
    repo?: string // used for code
  },
  destination: {
    type: 'email' | 'slack' | 'webhook',
    value: string,
  },
  name: string,
  isActive: boolean,
  createdAt: Date,
  createdBy: string,
}

export default function Automations({ userSession }: { userSession: UserSession }) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = userSession.user;

  const integrations = [
    {
      id: 'github',
      name: 'GitHub',
      imageUrl: '/assets/integrations/github.svg',
      href: `${API_ENDPOINT}/routes/integrations/github/install?org=${user.org._id}`,
    },
    {
      id: 'vscode',
      name: 'VS Code',
      imageUrl: '/assets/integrations/vscode.svg',
      href: ``,
    },
    {
      id: 'slack',
      name: 'Slack',
      imageUrl: '/assets/integrations/slack.svg',
      href: `${API_ENDPOINT}/routes/integrations/slack/install?org=${user.org._id}`,
    },
    {
      id: 'notion',
      name: 'Notion',
      imageUrl: '/assets/integrations/notion.svg',
      href: `${API_ENDPOINT}/routes/integrations/notion/install?org=${user.org._id}`,
    },
  ]

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/routes/automations?userId=${user.userId}`)
      .then(({ data }) => {
        const { automations } = data;
        setAutomations(automations);
      })
      .finally(() => {
        setIsLoading(false);
      })
  }, [user]);

  /**
   * It takes an automationId and isActive boolean, and then it makes a PUT request to the API endpoint
   * to update the automation's isActive property
   * @param {string} automationId - The id of the automation that we want to toggle
   * @param {boolean} isActive - boolean - This is the new state of the switch.
   */
  const handleToggleSwitch = async (automationId: string, isActive: boolean) => {
    axios.put(`${API_ENDPOINT}/routes/automations/active?userId=${user.userId}`, { automationId, isActive })
      .then(() => {
        const newAutomations = automations.map(automation => (automation._id === automationId) ? {...automation, isActive} : automation);
        setAutomations(newAutomations);
      })
  }

  const hasAutomations = automations.length > 0;

  return (
    <>
    <Head>
      <title>Automations</title>
    </Head>
    <Layout user={userSession.user}>
    <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
      {/* Left sidebar & main wrapper */}
      <div className="flex-1 min-w-0 xl:flex">
        <Sidebar user={userSession.user} />
        {/* Projects List */}
        <div className="bg-white lg:min-w-0 lg:flex-1">
          <div className="pl-4 pr-6 pt-4 pb-4 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
          <div className="px-4 sm:px-0">
            { hasAutomations && <h2 className="text-lg font-medium text-gray-800">Automations</h2> }
          </div>
        </div>
        {
            !hasAutomations && !isLoading && <div className="pb-8">
              <div className="flex items-center justify-center">
                <img className="w-24 h-24" src="/assets/empty/automations.svg" alt="Empty Automations" />
              </div>
              <p className="text-center mt-6 text-gray-600 font-medium">
                No automations created
              </p>
              <p className="mt-1 text-center text-sm text-gray-400">
                Add one to get started
              </p>
              <div className="mt-4 flex justify-center">
                <button className="inline-flex items-center justify-center text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm py-2 px-8 font-medium">
                  Add Documentation
                </button>
              </div>
            </div>
          }
        {/* Stacked list */}
        <ul role="list">
            {automations.map((automation) => (
              <li key={automation._id}>
                <div className="ml-4 mr-6 h-px bg-gray-200 sm:ml-6 lg:ml-8 xl:ml-6 xl:border-t-0"></div>
                <a href="#" className="block hover:bg-gray-50">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 items-center">
                        { getAutomationTypeIcon(automation.type, 8, 5) }
                        <p className="text-sm font-medium text-gray-700 truncate">{automation.name}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                      <Switch
                          checked={automation.isActive}
                          onChange={() => handleToggleSwitch(automation._id, !automation.isActive)}
                          className="flex-shrink-0 group relative rounded-full inline-flex items-center justify-center h-4 w-9 cursor-pointer"
                        >
                          <span className="sr-only">Use setting</span>
                          <span aria-hidden="true" className="pointer-events-none absolute bg-white w-full h-full rounded-md" />
                          <span
                            aria-hidden="true"
                            className={classNames(
                              automation.isActive ? 'bg-primary' : 'bg-gray-200',
                              'pointer-events-none absolute h-4 w-9 mx-auto rounded-full transition-colors ease-in-out duration-200'
                            )}
                          />
                          <span
                            aria-hidden="true"
                            className={classNames(
                              automation.isActive ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none absolute left-0 inline-block h-5 w-5 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200'
                            )}
                          />
                        </Switch>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          { getTypeIcon(automation.type, 'flex-shrink-0 mr-1 h-4 w-4 text-gray-400') }
                          {automation.type === 'code' && automation.source.repo}
                          {automation.type === 'doc' && automation.source.doc}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          { getTypeIcon(automation.destination.type, 'flex-shrink-0 mr-1 h-4 w-4 text-gray-400') }
                          {automation.destination.value}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Integrations */}
      <div className="bg-gray-50 pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0">
        <div className="pl-6 lg:w-80">
          <div className="pt-6 pb-2">
            <h2 className="text-sm font-semibold">Integrations</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <Link key={integration.id} href={integration.href}>
                <div
                  className="relative rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm flex items-center space-x-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <div className="flex-shrink-0">
                    <img className="h-6 w-6" src={integration.imageUrl} alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href="#" className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                      <div className="flex space-x-0.5 items-center">
                        <p className="text-xs text-gray-500 truncate">{ user.org?.integrations != null && user.org.integrations[integration.id] ? 'Installed' : 'Not installed'}</p>
                        { user.org?.integrations != null && user.org.integrations[integration.id] ? <CheckCircleIcon className="h-3 w-3 text-green-600" /> : null }
                      </div>
                    </a>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Layout>
    </>
  )
};

const getServerSidePropsHandler: GetServerSideProps = async ({req}: any) => {
  const userSession = req.session.get('user') ?? null;
  const props = {userSession};
  return {props};
}

export const getServerSideProps = withSession(getServerSidePropsHandler);