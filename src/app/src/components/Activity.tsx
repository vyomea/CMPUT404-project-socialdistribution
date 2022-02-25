import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import processPayload from '../utils/GithubUtils';
import Link from '@mui/material/Link';

interface props {
  type: string;
  payload: any;
  repo: any;
}
const renderTypes = (type: string, newPayload: any) => {
  switch (type) {
    case 'PullRequestReviewEvent':
      return (
        <Card sx={{ minWidth: 100 }}>
          <CardContent>
            Reviewed <Link href={newPayload?.url}>{newPayload?.title}</Link> by{' '}
            {newPayload?.assignee} with status{': '}
            {newPayload?.review.state.charAt(0).toUpperCase() +
              newPayload?.review.state.slice(1, newPayload?.review.state.length) +
              ' '}
          </CardContent>
        </Card>
      );
    case 'PushEvent':
      return (
        <Card sx={{ minWidth: 100 }}>
          <CardContent>
            Pushed {newPayload?.size}{' '}
            <Link href={newPayload?.url}>{newPayload.size === 1 ? 'commit' : 'commits'}</Link> to
            the branch {newPayload?.branch}
          </CardContent>
        </Card>
      );
    case 'PullRequestEvent':
      return (
        <Card sx={{ minWidth: 100 }}>
          <CardContent>
            {newPayload?.action.charAt(0).toUpperCase() +
              newPayload?.action.slice(1, newPayload?.action.length) +
              ' '}
            a Pull Request: <Link href={newPayload?.url}>{newPayload?.title}</Link>
          </CardContent>
        </Card>
      );
    default:
      return null;
  }
};
const Activity = ({ type, payload, repo }: props) => {
  const newPayload = processPayload(payload, type);
  return <>{renderTypes(type, newPayload)}</>;
};
export default Activity;
