import { Redirect } from '@umijs/max';
import { useModel } from '@umijs/max';

export default (props: any) => {
  const { initialState } = useModel('@@initialState');

  if (!initialState?.currentUser) {
    return <Redirect to="/user/login" />;
  }

  return <>{props.children}</>;
};
