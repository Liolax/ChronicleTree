i still have issues. fix please.

1. exapmle of chartjs - const config = {
  type: 'bar',
  data: data,
  options: {
    indexAxis: 'y',
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    elements: {
      bar: {
        borderWidth: 2,
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Chart.js Horizontal Bar Chart'
      }
    }
  },
};

const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    }
  ]
};

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: -100, max: 100});
      });
      chart.update();
    }
  },
  {
    name: 'Add Dataset',
    handler(chart) {
      const data = chart.data;
      const dsColor = Utils.namedColor(chart.data.datasets.length);
      const newDataset = {
        label: 'Dataset ' + (data.datasets.length + 1),
        backgroundColor: Utils.transparentize(dsColor, 0.5),
        borderColor: dsColor,
        borderWidth: 1,
        data: Utils.numbers({count: data.labels.length, min: -100, max: 100}),
      };
      chart.data.datasets.push(newDataset);
      chart.update();
    }
  },
  {
    name: 'Add Data',
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels = Utils.months({count: data.labels.length + 1});

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(-100, 100));
        }

        chart.update();
      }
    }
  },
  {
    name: 'Remove Dataset',
    handler(chart) {
      chart.data.datasets.pop();
      chart.update();
    }
  },
  {
    name: 'Remove Data',
    handler(chart) {
      chart.data.labels.splice(-1, 1); // remove the label first

      chart.data.datasets.forEach(dataset => {
        dataset.data.pop();
      });

      chart.update();
    }
  }
];




P.S. when change chronicle-tree-final-report.md, follow: 
Executive Summary
1 Introduction
This template for technical report is provided for your convenience. It should be seen as a guide rather than an obligatory form. Your individual report might require changes in terms of format or content (i.e., headings) or both.
Suggested wordcount: 6000-8000 words (starting with the Introduction up to and not including Bibliography)
1.1 Background
Why?
1.2 Aims
What?
1.3 Technologies
How? - Brief description of the technologies used in the project. Do not copy & paste descriptions from websites here, but describe what it is and how it contributes to your project.
1.4 Structure
Brief overview of each chapter
2 System
2.1 Requirements
This section will be similar to your original requirements specification. Requirements have probably evolved somewhat since. Where this is the case explain what changed and why.
2.1.1 Functional requirements
2.1.2 Data requirements
2.1.3 User requirements
2.1.4 Environmental requirements
2.1.5 Usability requirements
2.2 Design and Architecture
Describe the design, system architecture and components used. Describe the main algorithms used in the project. (Note: use standard mathematical notations if applicable).
An architecture diagram may be useful. In case of a distributed system, it may be useful to describe functions and/or data structures in each component separately.
2.3 Implementation
Describe the main classes/functions used in the code. Consider to show and explain interesting code snippets where appropriate.
2.4 Testing
Describe any testing tools, test plans and test specifications used in the project
2.5 Graphical User Interface (GUI) Layout
Provide screenshots of key screens and explain.
2.6 Customer testing
Provide evidence for and results of customer testing. This may include ratings or quotes from the customer.
2.7 Evaluation
How was the system evaluated and what are the results? In many cases, this will include usage data and user feedback. It may also include performance evaluations, scalability, correctness, etc. depending on the focus of the project.
Quantitative results may be reported in tables or figures. Note that tables have their caption above the table and need to be cross referenced in the text (see Table 1). In many cases, tables are better to read if you skip the vertical lines.

Table 1: Performance with and without caching
	Nwithout	Nwith	Std.-Deviationwith	Std.-Deviationwithout	p
Records	100	200	2.54	3.97	.002
Data (GB)	100	200	2.54	3.97	.002
Speed	100	200	2.54	3.97	.002


Figures have their caption below the figure as shown in Figure 1. Make sure that if you use colour, the figure is still readable when printed in black & white, e.g., by using additional symbols, patterns, etc.

Figure 1: Learning gain across different experimental groups

3 Conclusions
Describe the advantages/disadvantages, opportunities, and limits of the project.
4 Further development or research
With more resources, where could the results of this project lead to?
5 References
It is recommended that students use the APA, Berkeley, Harvard or other internationally approved style. Here is an example of the APA citation style:

Wilcox, R. V. (1991). Shifting roles and synthetic women in Star Trek: The Next Generation. Studies in Popular Culture, 13(2), 53-65.

In the text this article can be cited as “Wilcox (1991)” or “(Wilkox, 1991)”.

References to websites must include the access dates.


The NCI library provides a guide on referencing
https://libguides.ncirl.ie/referencingandavoidingplagiarism



6 Appendix
6.1 Project Proposal
6.2 Project Plan
6.3 Requirement Specification
6.4 Monthly Journal
6.5 Other Material Used
Any other reference material used in the project.

follow Project Module Brief - Release date: 21 May 2025
Due date: 9 August 2025 @11.55pm
Lecturer: Hamilton V. Niculescu
________________________________________________________________

Project
CA1 (Interim report) + Final project brief

Submission extension: If you need to apply for an extension - https://nci360.ncirl.ie/

TURNITIN: All report submissions will be electronically screened for evidence of academic misconduct (i.e., plagiarism and collusion).
Use of AI in Teaching and Learning: Student Guide
https://libguides.ncirl.ie/useofaiinteachingandlearning/studentguide 


Learning outcomes:
LO1	Specify, analyse, design, implement, test and document a medium to large scale project in the chosen area of specialisation under the supervision of a project co-ordinator
LO2	Explain and justify the use and application of technology for a project
LO3	Develop and enhance communication and presentation skills

Please read, sign, add date, and submit this document using the upload point on Moodle, by 
7 June 2025 @11.55pm (week 3)

You are tasked with co-ordinating and delivering a showcase project which demonstrates your ability as a software/web developer or cyber security specialist. This project presents an opportunity for you to implement the skillset which you have acquired. The project you are required to produce will be a combination of a wide variety of skills which include:
Conception – You must identify a project which displays innovation relating to the integration of technologies deployed to achieve your goal
Project Management – You must take the concept identified and use project management skills to bring the concept to completion aiming to develop a commercially viable software tool. Ensuring that you meet each deadline and deliverable date is a crucial element of this process
Development – You must use your skillset to develop a Software or Web application that is of excellent standard and comprises of a high level of complexity affording users both practicality and a quality user experience. Cyber-security students must enforce a strict adherence to secure programming principles throughout. For this you must implement a complex server-side functionality and integrate client-side scripting which will provide a rich internet application interface for the user
Testing – Throughout the process you must maintain a detailed log of test plans and results. Details should include functionality tests, unit tests, integration testing, security testing, malicious intent testing, etc.
Pitching - Once the project is complete you must pitch the idea through a presentation which showcases the innovation and functionality of the application. This presentation will be a perfect opportunity to show your talents and achievements
The project 
The project which you are about to undertake is entirely based upon concepts identified by yourself. The elements contained in the project will be of your own consideration and the underpinning concept will stem from an area of interest to you. 
However, there are certain criteria which MUST be met:
You must use a server-side programming language to maintain a complex persistent data storage pertaining to the application functionality
You must use a client-side programming language to present a graphical user interface for the application
You must produce detailed academic documentation of exceptional quality with academic references, correct structure, and precise formatting suitable for the level you are studying at
Once you stick to the details outlined in this brief, then you will be free to choose the application concept and develop a software tool which interests you.
This module is assessed with 100% Continuous Assessment, and it is the responsibility of the learner to ensure all project deadlines are adhered to!
Start with… 
7 June 2025 @11.55pm (week 3)
1.Signed Project Brief (this document)
2.Project Proposal
3.NCI Ethics Approval Form

As you go… 
21 June 2025 @11.55pm (week 5)
1.Project Requirements Specification

Interim report…
28 June 2025 @11.55pm (week 6)
1.Interim progress report
N.B. This will be in the form of a written report, weighting 20% of the overall grade 
Continue with…
19 July 2025 @11.55pm (week 9)
1.Project Analysis & Design Documentation

Live presentation *
30 July & 6 August 2025 (weeks 11 & 12), during class (6pm – 10pm)
1.Live presentation of your project via Teams. Duration: 5 min. max. each (subject to change), including any Q&A session.

Final submission *
9 August 2025 @11.55pm (week 12)
1.Video of the final and complete project
2.Project Final Report, including the Declaration Project Cover Sheet
3.Project Code
* weighting 80% of the overall grade

Marking rubric: The dissertation is written in a formal academic style; with very clear statements and conclusions and discussion of the project findings and implication, and use proper Harvard Referencing Style (HRS).
Excellent statements and clear presentation of results. Excellent use of illustrations, code samples, etc. Conclusions are clearly supported by the results. Clear, concise and detailed project planning throughout the life of the project. Reference to document trail for revisions to the project scope. Evidence of contingency plans activated in response to pre-planned triggers. Response to scope changes demonstrated clear prioritisation of project goals. A project that addresses complex issues, using sophisticated software development. An innovative solution based on novel research to produce a commercially viable software tool. Exploits leading edge features of new or emerging technologies or exploits chosen technologies to the fullest extent possible. Project is close to commercial implementation. Evidence of Evaluation/ System testing. 

PS.S. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. always update ROADMAP.md after code changes.

- Check if real content. 