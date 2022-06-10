import { Combobox } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/solid";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../helpers/api";
import { classNames } from "../../helpers/functions";
import { DocumentationTypeIcon } from "../../helpers/Icons";
import { getSubdomain } from "../../helpers/user";
import { Doc, Org, User } from "../../pages";
import AddDocumentation, { addDocumentationMap, AddDocumentationType } from "../commands/documentation/AddDocumentation";
import DocItem from "../DocItem";

const rolesOptions = [
  { id: 'founder', title: 'Founder' },
  { id: 'executive', title: 'Executive' },
  { id: 'em', title: 'Engineering Manager' },
  { id: 'pm', title: 'Product Manager' },
  { id: 'engineer', title: 'Engineer' },
  { id: 'tw', title: 'Technical Writer' },
  { id: 'other', title: 'Other' },
]

const sizeOptions = [
  { id: '1', title: 'Individual' },
  { id: '2-5', title: '2 - 10' },
  { id: '11-50', title: '11 - 50' },
  { id: '51-200', title: '51 - 200' },
  { id: '200+', title: '200+' },
]

const appsOptions = [
  { id: 'github', title: 'GitHub' },
  { id: 'vscode', title: 'VS Code' },
  { id: 'slack', title: 'Slack' },
  { id: 'none', title: 'None of the above' },
]

const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  return <div className="mt-4 flex space-x-2">
  {[0, 1, 2, 3].map((i) => (
      <>
        {
          i > currentStep && <span key={i} className="h-1 w-14 bg-slate-200 rounded-sm"></span>
        }
        {
          i <= currentStep && <span key={i} className="h-1 w-14 bg-primary rounded-sm"></span>
        }
      </>
    ))
  }
  </div>
}

type OnboardingProps = {
  user: User,
  org: Org,
}

export default function Onboarding({ user, org }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const CurrentStep = () => {
    switch (step) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 user={user} org={org} />;
      case 2:
        return <Step2 org={org} />;
      case 3:
        return <Step3 />;
      default:
        return null;
    }
  }

  const isLastPage = step === 3;

  const nextPage = () => {
    if (isLastPage) {
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
        <div className="w-96 max-w-full mx-auto py-12">
          <CurrentStep />
          <div className="flex mt-8 space-x-2">
            {
              step > 0 && <button
              className="bg-white border border-gray-500 hover:bg-gray-100 py-1 px-6 rounded-sm text-gray-600"
              onClick={() => setStep(step - 1)}
            >Back</button>
            }
            <button
              className="bg-primary hover:bg-hover py-1 px-6 rounded-sm text-white"
              onClick={nextPage}
            >{isLastPage ? 'Complete' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step0() {
  const currentStep = 0;
  return <>
    <h1 className="text-3xl font-semibold">
      Welcome <span className="text-primary">Han</span> 👋
    </h1>
    <p className="mt-1 text-gray-600">
      First things first, tell us about yourself
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="w-96 max-w-full grid grid-cols-2 gap-4">
            {rolesOptions.map((roleOption) => (
              <div key={roleOption.id} className="flex items-center">
                <input
                  id={roleOption.id}
                  name="role"
                  type="radio"
                  defaultChecked={roleOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={roleOption.id} className="ml-3 block text-sm text-gray-700">
                  {roleOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">How big is your team?</label>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {sizeOptions.map((sizeOption) => (
              <div key={sizeOption.id} className="flex items-center">
                <input
                  id={sizeOption.id}
                  name="size"
                  type="radio"
                  defaultChecked={sizeOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={sizeOption.id} className="ml-3 block text-sm text-gray-700">
                  {sizeOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">Which of the following do you or your team use?</label>
        <p className="text-sm leading-5 text-gray-500">Check all that apply</p>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {appsOptions.map((appOption) => (
              <div key={appOption.id} className="flex items-center">
                <input
                  id={appOption.id}
                  name="role-option"
                  type="checkbox"
                  defaultChecked={appOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={appOption.id} className="ml-3 block text-sm text-gray-700">
                  {appOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  </>;
}

function Step1({ user, org }: OnboardingProps) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isAddingDocOpen, setIsAddingDocOpen] = useState(false);
  const [addDocumentationType, setAddDocumentationType] = useState<AddDocumentationType>();
  const currentStep = 1;

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/routes/docs`, {
      params: {
        userId: user.userId,
        subdomain: getSubdomain(window.location.host)
      }
    })
      .then((docsResponse) => {
        const { docs } = docsResponse.data;
        setDocs(docs);
      });
  }, [user.userId]);

  return <>
    <AddDocumentation
      user={user}
      org={org}
      isOpen={isAddingDocOpen}
      setIsOpen={setIsAddingDocOpen}
      setIsAddDocLoading={() => {}}
      overrideSelectedRuleType={addDocumentationType}
    />
    <h1 className="text-3xl font-semibold">
      Let&apos;s add some <span className="text-primary">documentation</span> 🗃
    </h1>
    <p className="mt-1 text-gray-600">
      You can import or link your existing pages
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div className="bg-white rounded-md shadow-md">
        <Combobox onChange={() => {}} value="">
          <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
            {Object.values(addDocumentationMap).map((item) => (
              <Combobox.Option
                key={item.type}
                value={item}
                className={({ active }) =>
                  classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                }
                onClick={() => { setIsAddingDocOpen(true); setAddDocumentationType(item.type) }}
              >
                {({ active }) => (
                  <>
                    <DocumentationTypeIcon
                      type={item.type}
                    />
                    <div className="ml-4 flex-auto">
                      <p
                        className={classNames(
                          'text-sm font-medium',
                          active ? 'text-gray-900' : 'text-gray-700'
                        )}
                      >
                        {item.title}
                      </p>
                      <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                        {item.description}
                      </p>
                    </div>
                    <ChevronRightIcon
                      className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                      aria-hidden="true"
                    />
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
      </Combobox>
      </div>
      <div>
        <h1 className="text-lg">Documents added</h1>
        <ul className="mt-2 bg-white rounded-md p-3 shadow-md">
          {docs.map((doc) => (
            <DocItem
              user={user}
              key={doc._id}
              doc={doc}
              docs={docs}
              setDocs={setDocs}
              onClick={() => {}}
              setSelectedDoc={() => {}}
              removeSeparators
            />
          ))}
          </ul>
        </div>
    </div>
  </>;
}

function Step2({ org }: { org: Org }) {
  const integrations = [
    {
      type: 'slack',
      title: 'Slack',
      description: 'Connect with your workspace',
      iconSrc: '/assets/integrations/slack.svg',
      installUrl: `${API_ENDPOINT}/routes/integrations/slack/install?org=${org._id}`,
    },
    {
      type: 'github',
      title: 'GitHub',
      description: 'Enable documentation review',
      iconSrc: '/assets/integrations/github.svg',
      installUrl: `${API_ENDPOINT}/routes/integrations/github/install?org=${org._id}`,
    },
    {
      type: 'vscode',
      title: 'VS Code',
      description: 'Connect code to documentation',
      iconSrc: '/assets/integrations/vscode.svg',
      installUrl: 'vscode:extension/mintlify.connector',
    }
  ]
  const currentStep = 2;
  return <>
    <h1 className="text-3xl font-semibold">
      Let&apos;s get you{' '}<span className="text-primary">integrated</span> 🔌
    </h1>
    <p className="mt-1 text-gray-600">
      Connect with the apps that you use
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <div className="mt-2 bg-white rounded-md p-3 shadow-md">
        <Combobox onChange={() => {}} value="">
          <Combobox.Options static className="scroll-py-3 overflow-y-auto">
            {integrations.map((integration) => (
              <Link key={integration.type} href={integration.installUrl}>
                <Combobox.Option
                  value={integration}
                  className={({ active }) =>
                    classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                  }
                  onClick={() => {}}
                >
                  {({ active }) => (
                    <>
                      <img className="h-5 w-5" src={integration.iconSrc} alt={integration.title} />
                      <div className="ml-4 flex-auto">
                        <p
                          className={classNames(
                            'text-sm font-medium',
                            active ? 'text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {integration.title}
                        </p>
                        <p className={classNames('text-sm', active ? 'text-gray-700' : 'text-gray-500')}>
                          {integration.description}
                        </p>
                      </div>
                      <ChevronRightIcon
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-700"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </Combobox.Option>
              </Link>
            ))}
          </Combobox.Options>
      </Combobox>
        </div>
      </div>
    </div>
  </>;
}

function Step3() {
  const currentStep = 3;
  return <>
    <h1 className="text-3xl font-semibold">
      Invite your{' '}<span className="text-primary">team</span> ✉️
    </h1>
    <p className="mt-1 text-gray-600">
      You can also do this later in the app
    </p>
    <ProgressBar currentStep={currentStep} />
    <div className="mt-6 space-y-8">
      <div>
        <label className="text-base font-medium text-gray-900">What best describes what you do?</label>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {rolesOptions.map((roleOption) => (
              <div key={roleOption.id} className="flex items-center">
                <input
                  id={roleOption.id}
                  name="role"
                  type="radio"
                  defaultChecked={roleOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={roleOption.id} className="ml-3 block text-sm text-gray-700">
                  {roleOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">How big is your team?</label>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {sizeOptions.map((sizeOption) => (
              <div key={sizeOption.id} className="flex items-center">
                <input
                  id={sizeOption.id}
                  name="size"
                  type="radio"
                  defaultChecked={sizeOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={sizeOption.id} className="ml-3 block text-sm text-gray-700">
                  {sizeOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label className="text-base font-medium text-gray-900">Which of the following do you or your team use?</label>
        <p className="text-sm leading-5 text-gray-500">Check all that apply</p>
        <fieldset className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {appsOptions.map((appOption) => (
              <div key={appOption.id} className="flex items-center">
                <input
                  id={appOption.id}
                  name="role-option"
                  type="checkbox"
                  defaultChecked={appOption.id === 'email'}
                  className="focus:ring-0 h-4 w-4 text-primary border-gray-300"
                />
                <label htmlFor={appOption.id} className="ml-3 block text-sm text-gray-700">
                  {appOption.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  </>;
}