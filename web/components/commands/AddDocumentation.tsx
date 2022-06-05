import { Fragment, useState } from 'react'
import { Combobox, Dialog, Transition } from '@headlessui/react'
import { classNames } from '../../helpers/functions'
import { AutomationTypeIcon } from '../../helpers/Icons';
import { AutomationType } from '../../pages/automations';
import { ChevronRightIcon } from '@heroicons/react/solid';
import { User } from '../../pages';

type AutomationData = {
  type: AutomationType;
  title: string;
  description: string;
}

export const addDocumentationMap: { doc: AutomationData, code: AutomationData } = {
  doc: {
    type: 'doc',
    title: 'Documentation change',
    description: 'Get notified when documentation changes',
  },
  code: {
    type: 'code',
    title: 'Code changes',
    description: 'Get notified when connected code changes',
  },
};

type AddDocumentationProps = {
  user: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsAddingDocumentation?: (isAddingAutomation: boolean) => void;
}

export default function AddDocumentation({ user, isOpen, setIsOpen, setIsAddingDocumentation }: AddDocumentationProps) {
  const [selectedRuleType, setSelectedRuleType] = useState<AutomationType>();

  const onToPrimarySelection = () => {
    setSelectedRuleType(undefined);
  }

  const onClose = () => {
    setIsOpen(false);
  }

  return (
    <Transition.Root show={isOpen} as={Fragment} appear>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            afterLeave={() => setSelectedRuleType(undefined)}
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              {/* { selectedRuleType && (
                <AutomationConfig
                  user={user}
                  automationType={selectedRuleType}
                  onCancel={onToPrimarySelection}
                  setIsAddAutomationOpen={setIsOpen}
                  setIsAddingAutomation={setIsAddingAutomation}
                />
              ) } */}
              {
                selectedRuleType == null && (<Combobox onChange={() => {}} value="">
                  <Combobox.Options static className="max-h-96 scroll-py-3 overflow-y-auto p-3">
                    {Object.values(addDocumentationMap).map((item) => (
                      <Combobox.Option
                        key={item.type}
                        value={item}
                        className={({ active }) =>
                          classNames('flex items-center cursor-default select-none rounded-xl p-3 hover:cursor-pointer', active ? 'bg-gray-50' : '')
                        }
                        onClick={() => setSelectedRuleType(item.type)}
                      >
                        {({ active }) => (
                          <>
                            <AutomationTypeIcon
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
              </Combobox>)
              }
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
