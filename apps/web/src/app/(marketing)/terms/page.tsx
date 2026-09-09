import type { Metadata } from 'next';
import { ContactEmail, LegalPlaceholder } from '@/components/marketing/contact-email';
import {
  LegalItem,
  LegalList,
  LegalPage,
  LegalSection,
} from '@/components/marketing/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service | Fynans',
  description:
    'The rules for using Fynans: what the service is and is not, how household sharing works, and the limits of automated receipt parsing.',
};

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="2026-09-09"
      summary={
        <>
          <p>
            Fynans is a tool for recording and sharing household spending. It is not a bank, a
            payment service or a source of financial advice. It never moves money and never touches
            your bank.
          </p>
          <p>
            Receipt parsing is automated and can be wrong. Check what it produces before you rely on
            it. Anything you scope to a household becomes visible to everyone in that household.
          </p>
          <p>
            Fynans is early software provided as is, with no uptime guarantee and no data export
            yet. Keep your own copy of anything you cannot afford to lose.
          </p>
        </>
      }
    >
      <LegalSection id="agreement" heading="1. This agreement">
        <p>
          These terms are a contract between you and{' '}
          <LegalPlaceholder>COMPANY LEGAL NAME</LegalPlaceholder>, registered at{' '}
          <LegalPlaceholder>REGISTERED ADDRESS</LegalPlaceholder>, which operates Fynans. By
          creating an account or using Fynans you accept them. If you do not accept them, do not use
          Fynans.
        </p>
        <p>
          Our <a className="font-medium text-primary-variant underline underline-offset-4 transition hover:text-primary" href="/privacy">Privacy Policy</a>{' '}
          explains what we do with your data and forms part of this agreement.
        </p>
      </LegalSection>

      <LegalSection id="what-fynans-is" heading="2. What Fynans is, and what it is not">
        <p>
          Fynans lets you photograph receipts, have their line items read automatically, record
          expenses and income, organise them into categories, stores and payment methods, and share
          selected records with a household that can approve or reject them.
        </p>
        <p>Fynans is not, and does not attempt to be:</p>
        <LegalList>
          <LegalItem>a bank, an e-money issuer or a payment institution;</LegalItem>
          <LegalItem>
            a way to send, hold, receive or settle money — Fynans never moves funds;
          </LegalItem>
          <LegalItem>
            connected to any bank account, card network or account aggregator. Payment methods in
            Fynans are labels for cash or a debit card that you create and update by hand, and every
            balance shown is derived from figures you entered;
          </LegalItem>
          <LegalItem>
            a source of financial, tax, accounting, investment or legal advice. Nothing Fynans shows
            you is advice, and you should not treat it as a substitute for a professional.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="eligibility" heading="3. Eligibility">
        <p>
          You must be at least <LegalPlaceholder>MINIMUM AGE</LegalPlaceholder> to use Fynans, and
          able to enter into a binding contract where you live.
        </p>
      </LegalSection>

      <LegalSection id="account" heading="4. Your account">
        <LegalList>
          <LegalItem term="Accurate details.">
            Register with an email address you control and keep it current.
          </LegalItem>
          <LegalItem term="Credentials are your responsibility.">
            You are responsible for everything done through your account. Do not share your
            password.
          </LegalItem>
          <LegalItem term="There is no automated password recovery yet.">
            Fynans does not currently send email, which means there is no password reset link and no
            email verification. If you lose access to your account, contact <ContactEmail /> and we
            will help you recover it manually. Choose a password you can retrieve from a password
            manager.
          </LegalItem>
          <LegalItem term="Sign-in with Google or Apple.">
            Where offered, using it means you also accept that provider&rsquo;s terms for the
            sign-in itself.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="households" heading="5. Households and shared records">
        <LegalList>
          <LegalItem term="Sharing is deliberate and visible.">
            Marking a transaction as shared, or attaching a receipt to a household, makes it
            readable by every member of that household, including the amounts and the parsed line
            items.
          </LegalItem>
          <LegalItem term="You cannot un-share what has been seen.">
            Removing a member or deleting a record stops future access. It does not undo what other
            members have already read.
          </LegalItem>
          <LegalItem term="Invitations.">
            Only invite people you intend to give this access to. Inviting someone discloses the
            email address you entered to that household.
          </LegalItem>
          <LegalItem term="Roles.">
            Household owners and admins can manage membership and remove members. Do not accept an
            owner or admin role in a household you do not trust.
          </LegalItem>
          <LegalItem term="Disputes between members">
            about shared spending are between you. We are not an arbiter of who owes what.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="receipts" heading="6. Receipts and automated parsing">
        <LegalList>
          <LegalItem term="You must have the right to upload">
            every receipt you add, and you must not upload documents containing other
            people&rsquo;s personal information beyond what a receipt normally carries.
          </LegalItem>
          <LegalItem term="Parsing is automated and imperfect.">
            Optical character recognition and AI extraction routinely misread amounts, quantities,
            dates and item names. Review every parsed receipt before relying on it. We do not
            warrant that any parsed figure or total is correct.
          </LegalItem>
          <LegalItem term="Third-party processing.">
            Text extracted from your receipts is sent to a third-party AI provider so it can be
            structured. Section 5 of the Privacy Policy describes exactly what is sent. Do not
            upload receipts whose text you are not permitted to have processed this way.
          </LegalItem>
          <LegalItem term="Limits.">
            We may apply limits on file size, file type, upload volume and processing frequency, and
            change them to keep the service running.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="acceptable-use" heading="7. Acceptable use">
        <p>You agree not to:</p>
        <LegalList>
          <LegalItem>
            access, or attempt to access, any account, household or record that is not yours;
          </LegalItem>
          <LegalItem>
            probe, scan or test the security of Fynans except to report a genuine vulnerability to
            us in good faith;
          </LegalItem>
          <LegalItem>
            scrape, crawl or automate access to the service outside its intended interface;
          </LegalItem>
          <LegalItem>
            upload unlawful content, malware, or anything designed to interfere with the service;
          </LegalItem>
          <LegalItem>
            resell, sublicense or white-label Fynans, or reverse engineer it except as the law
            expressly permits;
          </LegalItem>
          <LegalItem>
            place a load on the service that degrades it for other people.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="your-content" heading="8. Your content">
        <p>
          Your receipts, transactions and household records remain yours. You grant us only the
          licence we need to host, process, back up and display that content to you and to the
          household members you shared it with, for as long as your account exists. We do not use
          your content to train AI models, and we do not use it for advertising.
        </p>
      </LegalSection>

      <LegalSection id="availability" heading="9. Availability and change">
        <LegalList>
          <LegalItem term="Early software.">
            Fynans is under active development. Features may be added, changed or removed, and there
            is no guaranteed uptime or support response time.
          </LegalItem>
          <LegalItem term="No data export yet.">
            Fynans cannot currently export your history to a file. Until it can, keep your own copy
            of anything you cannot afford to lose. You can request a copy of your data by writing to{' '}
            <ContactEmail />.
          </LegalItem>
          <LegalItem term="Backups.">
            Our backup arrangements are{' '}
            <LegalPlaceholder>BACKUP POLICY</LegalPlaceholder>. Backups are for our disaster
            recovery, not a per-user undo.
          </LegalItem>
          <LegalItem term="Maintenance.">
            We may take Fynans offline for maintenance, with notice where practical.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="fees" heading="10. Fees">
        <p>
          Fynans is currently free to use. If we introduce charges, the terms will be{' '}
          <LegalPlaceholder>PRICING TERMS</LegalPlaceholder>, and we will give you at least{' '}
          <LegalPlaceholder>PRICING NOTICE PERIOD</LegalPlaceholder> notice before any charge
          applies to you. You will never be charged without agreeing first.
        </p>
      </LegalSection>

      <LegalSection id="termination" heading="11. Ending this agreement">
        <LegalList>
          <LegalItem term="You can leave at any time">
            by ceasing to use Fynans. Because account deletion is not yet self-service, write to{' '}
            <ContactEmail /> to have your account and data removed; we will do so within 30 days.
          </LegalItem>
          <LegalItem term="We may suspend or close an account">
            that breaches these terms, that is being used unlawfully, or where we are required to by
            law. Where it is reasonable to do so, we will warn you first and give you a chance to
            retrieve your data.
          </LegalItem>
          <LegalItem term="We may discontinue Fynans">
            entirely, with at least <LegalPlaceholder>SHUTDOWN NOTICE PERIOD</LegalPlaceholder>{' '}
            notice and an opportunity to retrieve your data.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="disclaimers" heading="12. Disclaimers">
        <p>
          To the fullest extent the law allows, Fynans is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranties of any kind, whether express or implied, including
          any implied warranty of merchantability, fitness for a particular purpose or
          non-infringement.
        </p>
        <p>
          In particular, we do not warrant that receipt parsing is accurate, that totals, balances
          or category breakdowns are correct, that the service will be uninterrupted or error-free,
          or that data will never be lost. Fynans is a record-keeping aid, and you remain
          responsible for your own financial decisions.
        </p>
      </LegalSection>

      <LegalSection id="liability" heading="13. Limitation of liability">
        <p>
          To the fullest extent the law allows, we are not liable for indirect, incidental, special
          or consequential loss, for lost profits or savings, or for any financial decision you took
          on the basis of what Fynans displayed. Our total liability arising out of or relating to
          Fynans is limited to{' '}
          <LegalPlaceholder>LIABILITY CAP</LegalPlaceholder>.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded, including
          liability for death or personal injury caused by negligence, or for fraud.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" heading="14. Indemnity">
        <p>
          You will indemnify us against claims, losses and reasonable costs arising from your
          unlawful use of Fynans, your breach of these terms, or content you uploaded that you did
          not have the right to upload.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="15. Changes to these terms">
        <p>
          We may update these terms. The date at the top of the page will change, and for material
          changes we will tell you inside the app before they take effect. Continuing to use Fynans
          after that means you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection id="law" heading="16. Governing law">
        <p>
          These terms are governed by the law of{' '}
          <LegalPlaceholder>JURISDICTION</LegalPlaceholder>, and disputes will be heard by the
          courts of <LegalPlaceholder>COURTS</LegalPlaceholder>. If you are a consumer, this does
          not deprive you of the protection of the mandatory law of the country you live in.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="17. Contact">
        <p>
          Questions about these terms go to <ContactEmail />, or by post to{' '}
          <LegalPlaceholder>REGISTERED ADDRESS</LegalPlaceholder>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
