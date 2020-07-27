import { getUserUidFromUserEmail } from './temp-auth-utils';
import { getCleanedTextInput, getCollaboratorUidArray }  from './filter-input.js';

describe('getCleanedTextInput tests', () => {
  test('No input entered in form (empty string)', () => {
    const testDefaultValue = 'Untitled Trip';
    const testRawName = '';
    const expectedTripName = testDefaultValue;

    const testTripName = getCleanedTextInput(testRawName, testDefaultValue);

    expect(testTripName).toEqual(expectedTripName);
  });

  test('Input entered into form', () => {
    const testDefaultValue = 'Untitled Trip';
    const testRawName = 'Trip to No Man\'s Land';
    const expectedTripName = testRawName;

    const testTripName = getCleanedTextInput(testRawName, testDefaultValue);

    expect(testTripName).toEqual(expectedTripName);
  });
});

const mockCurUserEmail = 'cur.user@email.com';
// TODO(Issue #55): Replace mock with real auth file once integrated.
jest.mock('./temp-auth-utils.js', () => ({
    getCurUserEmail: () => mockCurUserEmail,
    getUserUidFromUserEmail: (userEmail) => '_' + userEmail + '_',
}));
describe('getCollaboratorUidArray tests', () => {
  test('No collaborators entered', () => {
    const expectedUidArr = [getUserUidFromUserEmail(mockCurUserEmail)];
    // This is the list that is created when there are no collaborators added
    // (automatically one empty string from the constructor created ref).
    const testEmailArr = [''];

    const testUidArr = getCollaboratorUidArray(testEmailArr);

    expect(testUidArr).toEqual(expectedUidArr);
  });

  test('Some added collaborators', () => {
    const person1Email = 'p1@gmail.com';
    const person2Email = 'p2@outlook.com';
    const expectedUidArr = [getUserUidFromUserEmail(mockCurUserEmail),
        getUserUidFromUserEmail(person1Email), getUserUidFromUserEmail(person2Email)];
    const testEmailArr = [person1Email, person2Email];

    const testUidArr = getCollaboratorUidArray(testEmailArr);

    expect(testUidArr).toEqual(expectedUidArr);
  });

  test('Some added collaborators and some blank entries', () => {
    const person1Email = 'p1@gmail.com';
    const person2Email = 'p2@outlook.com';
    const expectedUidArr = [getUserUidFromUserEmail(mockCurUserEmail),
        getUserUidFromUserEmail(person1Email), getUserUidFromUserEmail(person2Email)];
    const testEmailArr = ['', person1Email, '', person2Email, ''];

    const testUidArr = getCollaboratorUidArray(testEmailArr);

    expect(testUidArr).toEqual(expectedUidArr);
  });
});