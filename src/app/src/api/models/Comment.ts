export default interface Comment {
  id: string;
  comment: string;
  contentType: 'text/markdown' | 'text/plain';
  published: Date;
}
