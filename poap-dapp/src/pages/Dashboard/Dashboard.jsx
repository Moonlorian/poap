import { Widget } from './components';
import { Account, SendToSelf, SignMessage } from './widgets';

const WIDGETS = [
  {
    title: 'Account',
    widget: Account,
    description: 'Connected account details',
    reference: 'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#account'
  },
  {
    title: 'Send to Self',
    widget: SendToSelf,
    description: 'Send a transaction to your own address',
    reference:
      'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#transactions'
  },
  {
    title: 'Sign message',
    widget: SignMessage,
    description: 'Message signing using the connected account',
    reference: 'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#account-1'
  }
];

const Dashboard = () => {
  return (
    <div className='flex flex-col gap-6 max-w-3xl w-full'>
      {WIDGETS.map((element) => {
        const WidgetComponent = element.widget;
        return (
          <Widget
            key={element.title}
            title={element.title}
            description={element.description}
            reference={element.reference}
          >
            <WidgetComponent />
          </Widget>
        );
      })}
    </div>
  );
};

export default Dashboard;
