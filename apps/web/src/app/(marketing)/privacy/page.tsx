import type { Metadata } from 'next';
import { ContactEmail, LegalPlaceholder } from '@/components/marketing/contact-email';
import {
  LegalItem,
  LegalList,
  LegalPage,
  LegalSection,
} from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What Fynans collects, how receipts are stored and processed, who can see your household data, and how to have it deleted.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="2026-09-09"
      summary={
        <>
          <p>
            Fynans stores the expenses, receipts and household information you put into it. It does
            not connect to your bank, it does not ask for card or account numbers, and it does not
            move money.
          </p>
          <p>
            Receipt images are kept in a private bucket and served only through links that expire
            after an hour. To read a receipt, Fynans extracts its text on infrastructure we run, and
            then sends only that text — never the image — to a third-party AI service so it can be
            turned into line items.
          </p>
          <p>
            There is no analytics, advertising or tracking of any kind in Fynans. You can delete any
            receipt yourself, and you can ask us to delete your whole account.
          </p>
        </>
      }
    >
      <LegalSection id="who-we-are" heading="1. Who we are">
        <p>
          Fynans is operated by <LegalPlaceholder>COMPANY LEGAL NAME</LegalPlaceholder>, registered
          at <LegalPlaceholder>REGISTERED ADDRESS</LegalPlaceholder>. In this policy &ldquo;we&rdquo;
          and &ldquo;us&rdquo; mean that entity, and &ldquo;you&rdquo; means the person using
          Fynans.
        </p>
        <p>
          For anything in this policy, including requests about your data, write to{' '}
          <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection id="what-you-give-us" heading="2. Information you give us">
        <LegalList>
          <LegalItem term="Account details.">
            Your email address and your first and last name. If you register with a password, it is
            hashed before it is stored; we never hold your password in a readable form.
          </LegalItem>
          <LegalItem term="Sign-in with Google or Apple.">
            If the operator has enabled it and you choose it, we receive the profile the provider
            returns — typically your name, email address and profile picture URL — along with the
            account identifier, the access and refresh tokens the provider issues, and the scopes
            you granted. We store these so you can sign in again.
          </LegalItem>
          <LegalItem term="The money records you enter.">
            Expenses and income, their amounts, dates and status, the categories, items and stores
            you create, your shopping baskets, and any reason you give when rejecting a household
            transaction.
          </LegalItem>
          <LegalItem term="Payment methods.">
            A label you choose, a type (cash or debit card), a colour, and the opening and current
            balances you type in. We never ask for a card number, a bank login, an IBAN or an
            account number, and Fynans does not connect to any bank, card network or account
            aggregator. Every balance in Fynans is a figure you entered or that Fynans calculated
            from figures you entered.
          </LegalItem>
          <LegalItem term="Receipts.">
            The image file you upload, together with its original filename, file type and size, and
            the text and line items extracted from it.
          </LegalItem>
          <LegalItem term="Household information.">
            The name of a household you create, its members and their roles, the balances tracked
            within it, and the email addresses you invite to it.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="collected-automatically" heading="3. Information collected automatically">
        <LegalList>
          <LegalItem term="Session records.">
            When you sign in we store a session token, its expiry, and the IP address and browser
            user agent the session was created from. Sessions expire after 30 days.
          </LegalItem>
          <LegalItem term="Push notification subscriptions.">
            Only if you turn on browser notifications. We store the push endpoint your browser
            issues, the two keys needed to encrypt messages to it, and your browser user agent.
            Turning notifications off removes the subscription.
          </LegalItem>
          <LegalItem term="Server logs.">
            Ordinary operational logs for requests and errors, kept for{' '}
            <LegalPlaceholder>LOG RETENTION PERIOD</LegalPlaceholder>.
          </LegalItem>
        </LegalList>
        <p>
          Fynans contains no analytics package, no advertising network, no tracking pixels and no
          third-party trackers. We do not profile you and we do not build advertising audiences.
        </p>
      </LegalSection>

      <LegalSection id="cookies" heading="4. Cookies and browser storage">
        <LegalList>
          <LegalItem term="Session cookies.">
            Set when you sign in so that Fynans knows who you are on the next request. They are
            strictly necessary; without them the app cannot work. They expire after 30 days or when
            you sign out.
          </LegalItem>
          <LegalItem term="Theme preference.">
            Your light, dark or system choice is saved in your browser&rsquo;s local storage. It
            never reaches our servers.
          </LegalItem>
        </LegalList>
        <p>We set no advertising or analytics cookies.</p>
      </LegalSection>

      <LegalSection id="receipts" heading="5. How receipts are handled">
        <p>This is the most sensitive data in Fynans, so here is the whole path a receipt takes.</p>
        <LegalList>
          <LegalItem term="Upload.">
            The image is written to S3-compatible object storage under a key that contains your
            account identifier and a random filename. The bucket is private; the file is never
            publicly readable and is never given a permanent URL.
          </LegalItem>
          <LegalItem term="Viewing.">
            When you open a receipt, we generate a signed link that stops working after one hour.
            Before generating it we check that the receipt belongs to you, or to a household you are
            a member of.
          </LegalItem>
          <LegalItem term="Text extraction.">
            The image is queued for processing and read by optical character recognition software
            running on infrastructure the operator controls. The image itself is not sent to any
            third party.
          </LegalItem>
          <LegalItem term="Structuring the text.">
            The extracted text is sent to a third-party AI text-completion service —{' '}
            <LegalPlaceholder>AI PROVIDER</LegalPlaceholder> — which returns the merchant, date,
            totals and line items in a structured form. That text can contain the merchant name, the
            date and time of purchase, and every item and price on the receipt. The receipt image is
            never sent.
          </LegalItem>
          <LegalItem term="Storage of the result.">
            The structured result is saved against your account so you can review and correct it.
            Automated extraction is not always right; you are expected to check it.
          </LegalItem>
          <LegalItem term="Deletion.">
            Deleting a receipt in Fynans removes both the stored image file and its database record.
            This is immediate and cannot be undone.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="households" heading="6. What your household can see">
        <p>
          Every transaction you record is either <span className="font-semibold text-text">personal</span>{' '}
          or <span className="font-semibold text-text">shared with a household</span>. Personal
          transactions are visible only to you. Shared transactions, and any receipt you attach to a
          household, are visible to every member of that household.
        </p>
        <LegalList>
          <LegalItem term="Invitations.">
            Inviting someone reveals the email address you typed to that household, and tells the
            invited person who invited them. Invitations expire after seven days.
          </LegalItem>
          <LegalItem term="Roles.">
            Households have owners, admins and members. Owners and admins can manage membership.
          </LegalItem>
          <LegalItem term="Approvals.">
            Shared transactions can be approved or rejected by the household, and a rejection reason
            is visible to its members.
          </LegalItem>
          <LegalItem term="Leaving a household.">
            Removing a member stops their future access. It does not retract information they have
            already seen.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="third-parties" heading="7. Who else processes your data">
        <p>We do not sell, rent or trade your data. It is shared only with:</p>
        <LegalList>
          <LegalItem term="Hosting and infrastructure.">
            <LegalPlaceholder>HOSTING PROVIDER</LegalPlaceholder>, which runs the database, the
            object storage and the job queue on our behalf.
          </LegalItem>
          <LegalItem term="Google and Apple.">
            Only if you choose to sign in with them, and only to the extent needed to authenticate
            you.
          </LegalItem>
          <LegalItem term="The AI text-completion provider">
            named in section 5, which receives extracted receipt text.
          </LegalItem>
          <LegalItem term="Legal disclosure.">
            Where we are required by law to disclose data, or where it is necessary to establish or
            defend a legal claim.
          </LegalItem>
        </LegalList>
        <p>
          Fynans does not currently send email of any kind, so no email provider processes your
          data.
        </p>
      </LegalSection>

      <LegalSection id="location" heading="8. Where your data is stored">
        <p>
          Data is stored in <LegalPlaceholder>HOSTING REGION</LegalPlaceholder>. Where data is
          transferred outside that region — including to the AI provider named in section 5 — the
          transfer relies on <LegalPlaceholder>TRANSFER MECHANISM</LegalPlaceholder>.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="9. Keeping and deleting data">
        <LegalList>
          <LegalItem term="While your account is open">
            we keep what you have entered, so that your history stays intact. Nothing is deleted on
            a timer.
          </LegalItem>
          <LegalItem term="You can delete individual records yourself">
            — receipts, transactions, categories, items, stores and payment methods — from inside
            the app.
          </LegalItem>
          <LegalItem term="Account deletion is not yet self-service.">
            Fynans does not currently have a &ldquo;delete my account&rdquo; button or a data
            export. To have your account deleted, write to <ContactEmail /> and we will remove your
            records and your stored receipt files within 30 days. We will confirm when it is done.
          </LegalItem>
          <LegalItem term="Backups.">
            Deleted data may persist in encrypted backups for up to{' '}
            <LegalPlaceholder>BACKUP RETENTION PERIOD</LegalPlaceholder> before those backups are
            rotated out.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="security" heading="10. Security">
        <LegalList>
          <LegalItem term="Passwords">are hashed, never stored in readable form.</LegalItem>
          <LegalItem term="Receipt images">
            live in a private bucket and are reachable only through short-lived signed links issued
            after an ownership check.
          </LegalItem>
          <LegalItem term="Traffic">is encrypted in transit, and session cookies are marked secure.</LegalItem>
          <LegalItem term="Sessions">expire after 30 days.</LegalItem>
        </LegalList>
        <p>
          No system is completely secure, and Fynans is early software under active development. If
          you find a security problem, please report it to <ContactEmail /> before disclosing it
          publicly, and we will work with you on a fix.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" heading="11. Your rights">
        <p>
          Depending on where you live, you may have the right to access the data we hold about you,
          correct it, delete it, restrict or object to how we use it, and receive a copy in a
          portable form. To exercise any of these, write to <ContactEmail />. We will respond within
          30 days.
        </p>
        <p>
          You also have the right to complain to your data protection authority, which for us is{' '}
          <LegalPlaceholder>SUPERVISORY AUTHORITY</LegalPlaceholder>.
        </p>
      </LegalSection>

      <LegalSection id="children" heading="12. Children">
        <p>
          Fynans is not intended for anyone under{' '}
          <LegalPlaceholder>MINIMUM AGE</LegalPlaceholder>, and we do not knowingly collect their
          data. If you believe a child has created an account, contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="13. Changes to this policy">
        <p>
          When this policy changes we will update the date at the top of the page. If a change
          materially affects how your data is used, we will tell you inside the app before it takes
          effect.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="14. Contact">
        <p>
          Questions, requests and complaints about this policy go to <ContactEmail />, or by post to{' '}
          <LegalPlaceholder>REGISTERED ADDRESS</LegalPlaceholder>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
