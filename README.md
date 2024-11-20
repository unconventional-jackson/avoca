# Avoca AI Founding Engineer Take Home

This repository contains all the services and applications necessary for the Avoca AI take home.

## Application Overview

To access the application, navigate to [Avoca Take Home](https://avocatakehome.com). You can sign up with any email address you like and will be prompted to verify your email and enroll in 2FA. Verification codes will be sent from `hello@avocatakehome.com`. Once you have verified your email and enrolled in 2FA, you can log in and view the calls that are being streamed to you.

You will notice calls streaming on the left hand side. The behavior is a little finnicky. However, it should meet the intent of showcasing customer support managing incoming calls. Grey calls have ended already, red calls are ongoing but have not been assigned to a rep, and click on a call to assign it to yourself, turning it green. When viewing a call, you can see the transcript streaming in real-time.

You may view a list of customers, search for them dynamically, and create new customers. You can view jobs as well that have transpired. Within the customers page, on the far right of the table, you can view the customer's list of addresses and create new addresses based on new information. There could be some product optimization to this experience.

When viewing a call, you can search for an existing customer to associate with the call, or navigate to the customers tab to create a new customer before navigating back to the call to associate it. There is some friction to this experience which could be improved given time and product direction. After a customer has been associated with a call, you can create the job ticket for the call directly within the call. Note that job tickets cannot be overlapping; if a ticket for 2024-11-10 to 2024-11-15 exists for a customer, a new ticket cannot be created for that customer for 2024-11-12 to 2024-11-17, for example.

## Code Overview

We have a handful of services that are necessary to run the Avoca AI platform. These services are:

- `avoca-internal-api`: An NPM package for managing "internal" APIs that I have written for the Avoca AI platform. These are predominantly authentication endpoints.
- `avoca-external-api`: An NPM package for managing the "external" Avoca API. This is a wrapper around the Housecall Pro API and makes some slight adaptations to its original OpenAPI spec.
- `api-service`: A Node.js, Express server which manages both authentication and database interactions for the Avoca AI platform. It "acts" as if it was the Housecall Pro API by facading the `avoca-external-api` package, and manages authentication for it by implementing the `avoca-internal-api` package. This service manages our persistent connection to our Postgres database via Sequelize.
- `calls-service`: A Node.js, WebSocket server which emits stochastic "calls". Calls are logged in our database, and round-robin queued / streamed to the "employees" who are currently logged in.
- `database-service`: A migrations service for our Postgres database. This service is responsible for creating and managing the schema for our database. It is based on the `sequelize-cli` package.
- `frontend-service`: A React, Vite application which is the "frontend" for the Avoca AI platform. This service is responsible for displaying the calls to the "employees" who are currently logged in and allows them to manage customers and jobs.

## Technical Considerations

### Architecture

The Avoca AI platform uses a microscopic notion of microservices. As a take home, it's too small to truly be monolithic, and too simple to truly benefit from microservices, but in order to achieve the calls functionality, I chose to set up a standalone Websocket server. Additionally, to keep good separation of concerns, the database runs in its own container. For small workloads, it would be entirely appropriate to run all processes inside the same container, but this would not scale well.

### FAQ

**Why did you use Docker Compose?**
Docker Compose makes it really easy to run multiple containers and processes locally. Since this project is full stack and has notions of a frontend UI, a backend API, and a database, and the calls service, it made sense to use Docker Compose to manage all of these services.

**Wait, why didn't you put the frontend in a container? It's not in the Docker Compose!**
For reasons that I cannot explain, Vite does not play well with Docker. I tried to get it to work, but I was unable to get the frontend to run in a container effectively - something to do with Vite's `@rollup` `optionalDependencies` being platform-specific, and that is a pain to navigate when running Linux / AMD images on an ARM Mac while the dependencies in question appear to be Microsoft-related (don't ask me, I don't know, and [this GitHub issue helped me solve it for one project but did NOT work in this case for Avoca](https://github.com/vitejs/vite/discussions/15532)). Additionally, volumes were a pain to work with when trying to stand up hot-reloading for the frontend. So, I abandoned that in favor of just running the frontend locally.

**Why did you use Websockets for the calls service?**
The task was to `Build a tool for customer support that they can use while a call is happening.`. I figured, rather than seeding static data, since ChatGPT and other modern AI / LLM-style tools have the appearance of operating in real-time and or streaming information, it would be neat to stream the call transcripts with the information the support users are looking for. This would be a great way to keep the support users engaged and to make the tool feel more "real". Websockets gave a way to stream tokens from calls in semi-real time.

**Why are the phone calls not feature-complete?**
Time. I was interesting in demonstrating an experience and putting together the containers and making sure the networking "worked", less interested in solving the nuances of state management and figuring out the best ways to show calls vs. customers vs. jobs. I feel like what I have shown in the user interface should meet the intent pretty effectively.

**Why did you use Sequelize?**
It's straightforward to work with. There's a dozen different ORMs out there; I'm not a fan of MikroORM, TypeORM feels heavy, and Kysely and Knex both feel very clunky without adequate type support. Sequelize is a good balance of being lightweight and having good type support.

**Why did you use Express?**
And not NestJS or one of the other hot new frameworks? Express is easy, I'm not trying to reinvent the wheel; NestJS is way too heavy for a quick project like this.

**Why did you use REST? Why not GraphQL?**
GraphQL is great, and I would have been happy to use it, actually - the [GraphQL Codegen tooling](https://the-guild.dev/graphql/codegen/docs/getting-started) is extremely robust and simple to use, and GraphQL schemas are much simpler / faster to write than OpenAPI. However, since the Housecall Pro API is RESTful based on OpenAPI, I figured it would be easier to just stick with REST for this project.

**Why did you create two separate API packages?**
The Housecall Pro API is essentially "pure" - I wanted to leverage it for defining my endpoints but I did not want to modify it too much for net-new stuff. Because I had to introduce my own concepts (Phone Calls / Authentication), I needed separate data structures and therefore endpoints for interacting with that data. I could have extended the official Housecall Pro OpenAPI specification, but it felt cleaner (and more interesting) to set up a separate package for my own endpoints that I needed.

**Why did you roll your own auth?**
Since I'm an AWS guy, I would normally use Cognito, especially for quick projects, however, I've grown tired of Cognito's limitations and wanted to try something new. The main benefit I get from Cognito is cheap email verification, but 2FA is expensive and harder to set up with all the requisite Lambdas needed. Other auth services like Auth0 are faster to implement and better featured, but I find that they are way too expensive for small projects and highway robbery for big projects. Every time I've implemented auth, in particular, I've been hamstrung by the provider's lack of (easy) support for 2FA. So, I figured I'd roll my own since it's been such a pain point.

**How does the auth work?**
Good question - Employees sign up via self-service, using their email. SendGrid sends a verification email with a TOTP, after which they must set up 2FA using an authenticator app (SMS 2FA is not secure). After 2FA, users are issued a short lived access JWT with a refresh token. The calls service uses an API key to access the API service, and theoretically we could enforce port or IP-based whitelisting as well since they live in the same VPC subnet.

**Tell me about the infrastructure.**
Since everything is in containers, we need a VPC, and following security best practices I've got the API service, calls service, and database container in the private subnets, with a bastion host as an SSH jump box in the public subnets. That allows us to SSH in and pull and restart Docker images individually (and securely), and run migrations via an SSH tunnel against the database. The frontend is distributed via CloudFront on S3, which is definitely overkill for this, but it's a standard pattern I've used several times so that was the fastest way to go. Practically, it would make more sense _for this project_ to host the frontend statically out of its own container in the public subnet.

**Why did you use CloudFormation? Why not Terraform or CDK?**
I'm a fan of CDK on bigger teams, especially when a platform team has invested the time to set up useful constructs that enforce organization-wide patterns and best practices. However, I trust it as far as I can throw it - the ability to define infrastructure in dynamic TypeScript is powerful, and I've seen engineers take it too far with clever constructs and generally trying to be "smart" when it just ends up being confusing and hard to fix if the deployments break. I will say, that I would 100% use CDK if this was serverless, since the built-in ESBuild / bundling and deploying for Lambda is bar-none. I haven't really used Terraform yet. CloudFormation is easy, and useful for containerized deployments and gives me a clean view of all the resources I am managing on a small scale.

**Why is the deploy script so complex? Why not use CI like GitHub Actions?**
I haven't taken the time yet to figure out how to set up GitHub Actions for cross-AWS account deploys, which is what I'm doing here with managing a dev and prod account for deploys. GitHub Actions would indeed keep everything cleaner, or CircleCI or whatever your flavor is, but for local deploys on a small scale, I find it easier to just run a script.

**I can't deploy everything in one run!**
AWS makes it so you can _almost_ deploy everything in one run; however, there are some gotches. Some prework was necessary to manually purchase a domain, set up Hosted Zones, add NS records to map the subdomains to the TLD, and set up ACM certificates with DNS validation. Additionally, the Postgres database needs to be manually configured with both the user roles and the networking configuration in `pg_hba.conf` to allow traffic within the VPC. There are flags (e.g. `STEP_01_VPC`) in the deploy scripts to easily toggle which steps you want to run.

**Where are all the tests?**
I have some built out for authentication from prior work. In the interest of time, I didn't feel it useful to write additional tests for this project, since the business logic is very lightweight and intended to mirror what might effectively be a third-party API that we can treat as a black box. Yes, more tests would be better. No, I did not have time.

**What would you do differently at scale?**
From Avoca's business model, and reading through the API docs, it seems like the goal is to allow development teams to use Avoca to build their own internal tools, i.e. this project represents what one of your larger customers might do against the API. Architecturally, I think my approach makes sense on a small scale for an internal tool, and if we needed scale we'd use ECS / RDS respectively. I don't think serverless is useful here because of the streaming nature of calls, but I'm also not familiar with that technology yet to understand how it gets implemented and would be curious to learn more. Maybe some SQS for queueing the calls, which I handwaved over with my calls service and refetching stale calls logic. From Avoca's perspective, I would actually shard on customers, though, where each customer gets their own ECS deployment, following the Shopify "monolithic-we-manage-it-for-you-on-prem-ish" model. Different customers will have different scale needs and so it makes sense to shard per customer with Autoscaling groups per customer as well, since the API is stateless and the database is the only stateful component and it's easy to turn the data over to the customer that way.
