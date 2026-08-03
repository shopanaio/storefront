import { gid, postalAddress } from "../shared.js";

const address = (customerKey, addressKey, values) =>
  postalAddress({ id: gid("CustomerAddress", `${customerKey}-${addressKey}`), ...values });

export const customers = [
  {
    id: gid("Customer", "alex-morgan"),
    firstName: "Alex",
    lastName: "Morgan",
    displayName: "Alex Morgan",
    emailAddress: {
      emailAddress: "alex.morgan@example.com",
      marketingConsent: { state: "SUBSCRIBED" },
    },
    phoneNumber: { phoneNumber: "+1-917-555-0108" },
    addresses: [
      address("alex-morgan", "home", {
        firstName: "Alex", lastName: "Morgan", address1: "115 Wythe Avenue", address2: "Apt 4C",
        city: "Brooklyn", province: "New York", provinceCode: "NY", country: "United States",
        countryCode: "US", zip: "11249", phone: "+1-917-555-0108",
      }),
      address("alex-morgan", "office", {
        firstName: "Alex", lastName: "Morgan", company: "Morgan Design Studio", address1: "55 Water Street",
        address2: "Floor 8", city: "Brooklyn", province: "New York", provinceCode: "NY",
        country: "United States", countryCode: "US", zip: "11201", phone: "+1-917-555-0108",
      }),
    ],
    defaultAddressId: gid("CustomerAddress", "alex-morgan-home"),
    orderIds: [gid("Order", "1008"), gid("Order", "1005"), gid("Order", "1001")],
  },
  {
    id: gid("Customer", "jamie-chen"),
    firstName: "Jamie",
    lastName: "Chen",
    displayName: "Jamie Chen",
    emailAddress: {
      emailAddress: "jamie.chen@example.com",
      marketingConsent: { state: "UNSUBSCRIBED" },
    },
    phoneNumber: { phoneNumber: "+1-415-555-0192" },
    addresses: [
      address("jamie-chen", "home", {
        firstName: "Jamie", lastName: "Chen", address1: "740 Valencia Street", address2: null,
        city: "San Francisco", province: "California", provinceCode: "CA", country: "United States",
        countryCode: "US", zip: "94110", phone: "+1-415-555-0192",
      }),
    ],
    defaultAddressId: gid("CustomerAddress", "jamie-chen-home"),
    orderIds: [gid("Order", "1007"), gid("Order", "1003")],
  },
  {
    id: gid("Customer", "taylor-reed"),
    firstName: "Taylor",
    lastName: "Reed",
    displayName: "Taylor Reed",
    emailAddress: {
      emailAddress: "taylor.reed@example.com",
      marketingConsent: { state: "PENDING" },
    },
    phoneNumber: { phoneNumber: "+44-20-7946-0128" },
    addresses: [
      address("taylor-reed", "home", {
        firstName: "Taylor", lastName: "Reed", address1: "18 Willow Lane", address2: null,
        city: "London", province: "Greater London", provinceCode: "LND", country: "United Kingdom",
        countryCode: "GB", zip: "E8 3QW", phone: "+44-20-7946-0128",
      }),
    ],
    defaultAddressId: gid("CustomerAddress", "taylor-reed-home"),
    orderIds: [gid("Order", "1006"), gid("Order", "1002")],
  },
  {
    id: gid("Customer", "samira-haddad"),
    firstName: "Samira",
    lastName: "Haddad",
    displayName: "Samira Haddad",
    emailAddress: {
      emailAddress: "samira.haddad@example.com",
      marketingConsent: { state: "SUBSCRIBED" },
    },
    phoneNumber: { phoneNumber: "+49-30-5557-0140" },
    addresses: [
      address("samira-haddad", "home", {
        firstName: "Samira", lastName: "Haddad", address1: "Kollwitzstraße 42", address2: "3. OG",
        city: "Berlin", province: "Berlin", provinceCode: "BE", country: "Germany",
        countryCode: "DE", zip: "10405", phone: "+49-30-5557-0140",
      }),
    ],
    defaultAddressId: gid("CustomerAddress", "samira-haddad-home"),
    orderIds: [gid("Order", "1004")],
  },
  {
    id: gid("Customer", "casey-davis"),
    firstName: "Casey",
    lastName: "Davis",
    displayName: "Casey Davis",
    emailAddress: { emailAddress: "casey.davis@example.com", marketingConsent: null },
    phoneNumber: null,
    addresses: [],
    defaultAddressId: null,
    orderIds: [],
  },
];
