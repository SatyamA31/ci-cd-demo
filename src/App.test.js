// import { render, screen } from '@testing-library/react';
// import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app heading', async () => {
  render(<App />);
  const headingElement = await screen.findByText(/My CI\/CD App/i);
  expect(headingElement).toBeInTheDocument();
});