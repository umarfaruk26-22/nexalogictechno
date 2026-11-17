import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Service
from database import engine, SessionLocal

def seed_services():
    db = SessionLocal()
    
    # Check if services already exist
    print("Clearing old services for fresh seed of 10 highly detailed services...")
    db.query(Service).delete()
    db.commit()

    services_data = [
        {
            "title": "Enterprise Cloud Architecture & Migration",
            "slug": "cloud-architecture-migration",
            "meta_title": "Enterprise Cloud Migration & AWS/Azure Architecture Solutions",
            "long_description": """In today’s digital-first economy, shifting your infrastructure to the cloud is no longer optional—it is a critical requirement for scaling, security, and sustained competitive advantage. Our Enterprise Cloud Architecture & Migration service is engineered to help mid-to-large-scale organizations transition their legacy, on-premise servers and monolithic applications into highly optimized, resilient, and elastic cloud environments.

We partner directly with leading public cloud providers including Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) to design bespoke architectures tailored to your specific operational loads. The journey begins with a comprehensive, zero-cost infrastructure audit where our certified cloud architects analyze your existing network topology, database configurations, and application dependencies. We then formulate a strategic 'Lift and Shift' or 'Refactoring' roadmap that guarantees absolute minimal downtime and zero data loss during the transition.

Beyond mere migration, we integrate advanced auto-scaling configurations, multi-region failover protocols, and load balancing algorithms to ensure your platform remains online 99.99% of the time, even under massive traffic spikes. We also deploy strict Identity and Access Management (IAM) controls, data encryption at rest and in transit, and continuous monitoring tools to maintain rigorous compliance with global security standards such as SOC 2, ISO 27001, and HIPAA. 

Our ultimate goal is to dramatically reduce your Total Cost of Ownership (TCO) by optimizing resource consumption, eliminating hardware maintenance overhead, and shifting your IT budget from a CapEx to an OpEx model. By leveraging serverless computing and microservices architecture, we empower your development teams to innovate faster, deploy more reliably, and scale effortlessly.""",
            "image": "assets/images/services/service_cloud_1784465507254.png",
            "keyword": "cloud computing, AWS migration, Azure architecture, Google Cloud solutions, enterprise cloud, serverless, microservices, cloud security, auto-scaling, DevOps cloud",
            "tag": "Cloud, AWS, Azure, GCP, Migration, Architecture, Security, Serverless, Infrastructure, DevOps"
        },
        {
            "title": "Custom Software & Platform Engineering",
            "slug": "custom-software-engineering",
            "meta_title": "Bespoke Software Development & Full-Stack Platform Engineering",
            "long_description": """Off-the-shelf software rarely fits the unique, complex workflows of a growing enterprise. Our Custom Software & Platform Engineering division specializes in designing, developing, and deploying bespoke, high-performance applications that perfectly align with your strategic business objectives. We don't just write code; we engineer scalable, future-proof platforms that drive operational efficiency, enhance user engagement, and generate measurable ROI.

Our full-stack engineering teams are proficient in the latest, enterprise-grade technologies. For the backend, we leverage the raw speed of Go, the robust ecosystem of Node.js, and the data-processing power of Python, typically paired with high-availability PostgreSQL, MongoDB, or Redis databases. On the frontend, we craft highly interactive, blazing-fast user interfaces using React.js, Next.js, and Vue.js, ensuring a frictionless experience across all devices and screen sizes.

The development lifecycle at NexaLogic is rooted in Agile methodology. We break down massive projects into manageable sprints, delivering functional iterations of your software every two weeks. This transparent, iterative process ensures that you have constant visibility into the project's progress and the flexibility to pivot requirements based on user feedback or market changes. We emphasize Test-Driven Development (TDD), writing comprehensive unit and integration tests to guarantee that your software is bug-free and mathematically sound before it ever reaches production.

Whether you require a complex SaaS platform with multi-tenant architecture, an internal resource planning (ERP) system to streamline HR and logistics, or a high-frequency trading algorithm, our engineers deliver code that is clean, modular, and extensively documented. We build software that not only solves today's problems but is structurally prepared for tomorrow's scale.""",
            "image": "assets/images/services/service_software_1784465517307.png",
            "keyword": "custom software development, full-stack engineering, SaaS platform, Reactjs, Nodejs, Python, enterprise software, Agile development, software engineering",
            "tag": "Software, Development, Engineering, SaaS, React, Node, Python, Agile, Platform, Custom"
        },
        {
            "title": "Advanced Cybersecurity & Risk Management",
            "slug": "cybersecurity-risk-management",
            "meta_title": "Comprehensive Cybersecurity Audits & Enterprise Threat Protection",
            "long_description": """In an era where data breaches cost organizations millions in fines and irreparable reputational damage, reactive security is a recipe for disaster. Our Advanced Cybersecurity & Risk Management services provide proactive, military-grade protection for your entire digital ecosystem. We act as your elite, outsourced security operations center (SOC), identifying and neutralizing threats before they can compromise your network.

Our process begins with exhaustive Vulnerability Assessments and Penetration Testing (VAPT). Our certified ethical hackers simulate sophisticated, real-world cyberattacks—ranging from SQL injection and Cross-Site Scripting (XSS) to complex social engineering and zero-day exploits—against your web applications, mobile apps, and cloud infrastructure. We uncover hidden loopholes, misconfigurations, and outdated dependencies, providing you with a detailed executive report and a prioritized remediation roadmap.

Beyond testing, we implement robust, multi-layered defensive architectures. We deploy Next-Generation Firewalls (NGFW), Intrusion Detection and Prevention Systems (IDPS), and AI-driven endpoint protection that continuously monitors your network for anomalous behavior. We also enforce Zero Trust Architecture principles, ensuring that every user, device, and API request is rigorously authenticated and authorized, regardless of whether they are inside or outside your corporate perimeter.

Compliance is a critical pillar of our cybersecurity offering. We guide organizations through the complex labyrinths of global regulatory frameworks, including GDPR, CCPA, HIPAA, PCI-DSS, and SOC 2. From establishing strict data encryption protocols and automated backup routines to drafting comprehensive disaster recovery and business continuity plans (BCP), we ensure that your enterprise is not only secure from malicious actors but fully compliant with the law.""",
            "image": "assets/images/services/service_security_1784465529316.png",
            "keyword": "cybersecurity, penetration testing, risk management, data protection, network security, zero trust, compliance, HIPAA, SOC2, ethical hacking",
            "tag": "Cybersecurity, Security, VAPT, Protection, Privacy, Compliance, Hacking, ZeroTrust, InfoSec, Risk"
        },
        {
            "title": "Data Analytics & Business Intelligence",
            "slug": "data-analytics-business-intelligence",
            "meta_title": "Predictive Data Analytics & Corporate Business Intelligence (BI)",
            "long_description": """Your organization generates terabytes of data daily, but without the right tools to interpret it, that data is merely a storage expense. Our Data Analytics & Business Intelligence (BI) services transform raw, unstructured data into actionable, strategic insights that empower your leadership team to make highly informed, confident decisions and uncover hidden revenue streams.

We specialize in designing and deploying enterprise-grade Data Warehouses and Data Lakes using industry-leading technologies like Snowflake, Amazon Redshift, and Google BigQuery. Our data engineers construct robust ETL (Extract, Transform, Load) pipelines that seamlessly aggregate data from diverse, siloed sources—including CRMs, ERPs, marketing platforms, and IoT sensors—into a single, unified source of truth. We clean, normalize, and structure this data, ensuring absolute accuracy and reliability for downstream analysis.

Once the infrastructure is laid, our BI analysts create highly visual, interactive dashboards using tools like Tableau, Power BI, and Looker. We replace static, confusing spreadsheets with dynamic charts, graphs, and heatmaps that allow users to drill down into KPIs in real-time. Whether tracking sales performance, monitoring supply chain efficiency, or analyzing customer churn, our dashboards make complex data instantly understandable for non-technical stakeholders.

Furthermore, we implement advanced Predictive Analytics models utilizing statistical algorithms and machine learning techniques. By analyzing historical trends and identifying subtle correlations, we help you forecast future market behaviors, optimize inventory levels, predict equipment failures before they happen, and personalize marketing campaigns at an individual customer level. Stop guessing and start leading with data.""",
            "image": "assets/images/services/service_data_1784465541011.png",
            "keyword": "data analytics, business intelligence, BI dashboards, Tableau, Power BI, predictive analytics, data warehousing, Snowflake, BigQuery, ETL pipelines",
            "tag": "Data, Analytics, BI, Intelligence, Dashboards, BigData, SQL, Predictive, Reporting, Insights"
        },
        {
            "title": "Managed IT & Infrastructure Support",
            "slug": "managed-it-infrastructure-support",
            "meta_title": "24/7 Managed IT Services & Remote Infrastructure Support",
            "long_description": """Managing a modern IT infrastructure requires specialized skills, round-the-clock attention, and significant financial resources. For many organizations, maintaining an in-house IT department is an immense operational burden that distracts from their core business goals. Our Managed IT & Infrastructure Support service provides a comprehensive, fully outsourced solution, acting as your dedicated, highly capable technology partner 24 hours a day, 365 days a year.

We provide proactive, continuous monitoring of your entire network ecosystem—servers, routers, switches, firewalls, and endpoints. Utilizing advanced telemetry and AI-driven alerting systems, our Network Operations Center (NOC) detects and resolves performance bottlenecks, hardware degradations, and connectivity issues often before your end-users even notice a problem. We guarantee maximum system uptime, ensuring your business operations run smoothly without costly, unexpected interruptions.

Our rapid-response Helpdesk Support offers multi-tiered assistance for your employees. Whether it's troubleshooting software glitches, assisting with password resets, or resolving complex operating system errors, our friendly, certified technicians are just a call or click away. We utilize sophisticated ticketing systems to track every issue, ensuring swift resolution times and providing you with detailed monthly reports on IT performance and support metrics.

Beyond daily support, we handle all critical system administration tasks. This includes automating routine software updates and security patch management, configuring secure VPN access for remote workforces, managing Microsoft 365 or Google Workspace environments, and executing rigorous, automated data backups. We take the stress out of IT management, allowing you to focus entirely on scaling your business and serving your customers.""",
            "image": "assets/images/services/service_managed_it_1784465553038.png",
            "keyword": "managed IT services, IT support, helpdesk, infrastructure management, network monitoring, NOC, 24/7 support, system administration, IT outsourcing",
            "tag": "IT, ManagedServices, Support, Helpdesk, Infrastructure, Monitoring, Network, SysAdmin, Uptime, Tech"
        },
        {
            "title": "Native & Cross-Platform Mobile Development",
            "slug": "mobile-app-development",
            "meta_title": "iOS & Android Mobile App Development (Native & Flutter/React Native)",
            "long_description": """In a mobile-first world, your brand's application is often the primary touchpoint for consumer engagement. We design and develop stunning, high-performance mobile applications that captivate users, drive brand loyalty, and dominate app store rankings. From conceptualization and UI/UX design to backend API integration and rigorous quality assurance, we offer an end-to-end mobile engineering solution.

For applications demanding maximum hardware performance, intense graphical processing (like gaming), or deep integration with operating system features, our iOS (Swift/Objective-C) and Android (Kotlin/Java) experts build pristine Native Applications. We ensure flawless memory management, buttery-smooth 60fps animations, and strict adherence to Apple's Human Interface Guidelines and Google's Material Design principles.

For enterprises looking to accelerate time-to-market and reduce development costs without sacrificing quality, we highly recommend our Cross-Platform Development services utilizing Flutter and React Native. These modern frameworks allow us to write a single, unified codebase that compiles natively to both iOS and Android. The result is an application that looks, feels, and performs like a native app, but requires significantly less time to develop and maintain.

Our mobile engineering doesn't stop at the frontend. We architect secure, highly scalable backend REST and GraphQL APIs, integrate real-time web sockets for live chat features, implement secure payment gateways (Stripe, Apple Pay), and integrate complex geolocation and mapping services. Finally, we handle the entire deployment process, navigating the stringent review processes of the App Store and Google Play to ensure a successful, seamless launch.""",
            "image": "assets/images/services/service_mobile_1784465563471.png",
            "keyword": "mobile app development, iOS app, Android app, native development, cross-platform, Flutter, React Native, mobile UI/UX, app store deployment",
            "tag": "Mobile, AppDev, iOS, Android, Flutter, ReactNative, Smartphone, Tech, Development, UI"
        },
        {
            "title": "DevOps Automation & CI/CD Pipelines",
            "slug": "devops-automation-cicd",
            "meta_title": "Enterprise DevOps Consulting, Automation & CI/CD Implementations",
            "long_description": """The traditional barrier between software development and IT operations creates bottlenecks, deployment anxiety, and delayed time-to-market. Our DevOps Automation & CI/CD (Continuous Integration/Continuous Deployment) services shatter these silos. We implement robust, automated pipelines and cultural practices that enable your engineering teams to ship high-quality code faster, more frequently, and with absolute confidence.

We begin by containerizing your applications using Docker, ensuring that software runs consistently regardless of the environment—from a developer's local laptop to the production server. We then orchestrate these containers using Kubernetes, creating a highly resilient, self-healing infrastructure that automatically scales up during traffic surges and scales down to conserve resources during quiet periods. 

At the core of our DevOps strategy is the CI/CD pipeline, built using tools like Jenkins, GitLab CI, or GitHub Actions. Every time a developer commits code, the pipeline automatically triggers a suite of unit, integration, and security tests. If the code passes, it is automatically built, packaged, and deployed to staging or production environments. This eliminates human error in the deployment process, catches bugs instantly, and drastically reduces the integration headaches associated with large software releases.

Furthermore, we champion the 'Infrastructure as Code' (IaC) philosophy utilizing Terraform and Ansible. Instead of manually configuring servers, we write declarative scripts that provision networks, databases, and compute instances in minutes. This guarantees environment consistency, enables rapid disaster recovery, and provides complete version control over your entire infrastructure topology.""",
            "image": "assets/images/services/service_devops_1784465576333.png",
            "keyword": "DevOps, CI/CD, automation, Docker, Kubernetes, Jenkins, Infrastructure as Code, Terraform, Ansible, cloud orchestration",
            "tag": "DevOps, Automation, CI, CD, Docker, Kubernetes, Terraform, Deployment, Engineering, Cloud"
        },
        {
            "title": "AI & Machine Learning Integration",
            "slug": "ai-machine-learning-integration",
            "meta_title": "Artificial Intelligence & Enterprise Machine Learning Solutions",
            "long_description": """Artificial Intelligence is rapidly transitioning from science fiction to a fundamental business necessity. Our AI & Machine Learning Integration services empower forward-thinking enterprises to automate complex workflows, extract deep insights from massive datasets, and deliver hyper-personalized experiences to their customers. We build pragmatic, ROI-driven AI solutions that integrate seamlessly into your existing software ecosystem.

We specialize in Natural Language Processing (NLP) and Large Language Model (LLM) integrations. By leveraging frameworks like OpenAI, LangChain, and Hugging Face, we develop intelligent, context-aware chatbots and virtual assistants that can handle tier-one customer support, automate document summarization, and perform complex sentiment analysis on social media feeds. These AI agents learn from your corporate knowledge base to provide highly accurate, conversational responses 24/7.

Our data scientists also excel in Predictive Modeling and Computer Vision. We design custom neural networks using TensorFlow and PyTorch to solve highly specific industry challenges. In retail, we build recommendation engines that drastically increase cross-selling. In manufacturing, we deploy computer vision systems on edge devices for real-time quality control and defect detection on the assembly line. In finance, we train sophisticated anomaly detection algorithms to identify fraudulent transactions with pinpoint accuracy.

The implementation of AI is not just about building models; it is about MLOps. We ensure that your machine learning models are deployed securely, monitored continuously for algorithmic drift, and retrained automatically as new data flows into the system. Embrace the AI revolution and turn your data into your most powerful competitive weapon.""",
            "image": "assets/images/services/service_ai_1784465588279.png",
            "keyword": "artificial intelligence, machine learning, AI integration, NLP, predictive modeling, computer vision, TensorFlow, LLM, chatbots, MLOps",
            "tag": "AI, MachineLearning, ML, DeepLearning, NLP, Innovation, Tech, Future, Automation, DataScience"
        },
        {
            "title": "Blockchain & Web3 Solutions",
            "slug": "blockchain-web3-solutions",
            "meta_title": "Enterprise Blockchain Development, Smart Contracts & Web3",
            "long_description": """The internet is evolving towards decentralization, and blockchain technology is at the forefront of this paradigm shift. Our Blockchain & Web3 Solutions team provides end-to-end development services for enterprises looking to leverage the security, transparency, and immutability of distributed ledger technology. From conceptualizing tokenomics to deploying secure smart contracts on the mainnet, we guide you through the complexities of the Web3 landscape.

We specialize in developing robust Smart Contracts on leading EVM-compatible networks such as Ethereum, Polygon, and Binance Smart Chain, as well as alternative high-throughput chains like Solana. Our Solidity engineers write highly optimized, gas-efficient code that powers Decentralized Finance (DeFi) protocols, Non-Fungible Token (NFT) marketplaces, and Decentralized Autonomous Organizations (DAOs). Security is paramount; therefore, every smart contract undergoes rigorous internal auditing and formal verification to prevent vulnerabilities like reentrancy attacks.

Beyond public networks, we design and implement Private and Consortium Blockchains using frameworks like Hyperledger Fabric and R3 Corda. These permissioned ledgers are ideal for enterprise use cases such as supply chain tracking, secure medical record sharing, and cross-border bank settlements, providing verifiable cryptographic proof of transactions while maintaining strict data privacy among authorized participants.

We also build the bridge between the blockchain and the user by developing intuitive decentralized applications (dApps). Using Web3.js and Ethers.js integrated into modern React frontends, we create seamless interfaces that allow users to connect their cryptographic wallets (like MetaMask), sign transactions securely, and interact with the blockchain without needing deep technical knowledge.""",
            "image": "assets/images/services/service_blockchain_1784465598108.png",
            "keyword": "blockchain development, Web3, smart contracts, Ethereum, Solidity, DeFi, NFT marketplace, decentralized applications, dApps, Hyperledger",
            "tag": "Blockchain, Web3, Crypto, SmartContracts, Ethereum, DeFi, DApps, Decentralization, Innovation, Tech"
        },
        {
            "title": "Internet of Things (IoT) Connectivity",
            "slug": "iot-connectivity-solutions",
            "meta_title": "Enterprise IoT Solutions, Smart Devices & Sensor Connectivity",
            "long_description": """The physical and digital worlds are merging, creating unprecedented opportunities for automation and real-time monitoring. Our Internet of Things (IoT) Connectivity solutions enable enterprises to connect physical devices, vehicles, and industrial machinery to the cloud, creating intelligent ecosystems that generate massive operational efficiencies and entirely new revenue streams.

We handle the entire IoT technology stack, starting at the edge. Our embedded systems engineers write highly optimized C/C++ and Rust firmware for microcontrollers (like ESP32 and ARM Cortex), ensuring that sensors can reliably collect data on temperature, GPS location, vibration, and energy usage while operating on extreme low power. We implement secure, lightweight communication protocols such as MQTT, CoAP, and LoRaWAN to transmit this data seamlessly, even from remote or harsh environments with limited bandwidth.

In the cloud, we architect highly scalable IoT ingestion pipelines using AWS IoT Core or Azure IoT Hub capable of processing millions of telemetry messages per second. This data is instantly routed into time-series databases for real-time visualization and alerting. If a factory motor begins to vibrate beyond a specific threshold, or a refrigerated logistics truck drops in temperature, automated alerts are dispatched instantly to managers and maintenance crews.

Furthermore, we develop intuitive web and mobile command-center dashboards that give you total control over your connected fleet. Through Over-The-Air (OTA) updates, you can securely patch firmware or push new features to thousands of devices simultaneously. From smart agriculture and connected healthcare devices to Industry 4.0 automated factories, we turn your physical assets into intelligent data sources.""",
            "image": "assets/images/services/service_iot_1784465609474.png",
            "keyword": "IoT, Internet of Things, smart devices, sensor connectivity, MQTT, AWS IoT, embedded systems, edge computing, Industry 4.0, telemetry",
            "tag": "IoT, SmartDevices, EdgeComputing, Connectivity, Hardware, Automation, Sensors, Industry4, Tech, Cloud"
        }
    ]

    for s_data in services_data:
        service = Service(**s_data)
        db.add(service)
    
    db.commit()
    print("Successfully seeded 10 highly detailed services!")
    db.close()

if __name__ == "__main__":
    seed_services()
