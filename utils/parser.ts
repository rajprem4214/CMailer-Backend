// interface ResumeData {
//     college_name: string[];
//     company_names: string[] | null;
//     degree: string[];
//     designation: string[];
//     email: string;
//     mobile_number: string;
//     name: string;
//     no_of_pages: number;
//     skills: string[];
//     total_experience: number;
// }

export function parseResumeText(text: string) {
    // Define regex patterns with optional whitespace handling
    const collegeNameRegex = /college\s*name\s*:\s*([^\n]+)/i;
    const companyNamesRegex = /company\s*names?\s*:\s*([^\n]+)/i;
    const degreeRegex = /degree\s*:\s*([^\n]+)/i;
    const designationRegex = /designation\s*:\s*([^\n]+)/i;
    const emailRegex = /email\s*:\s*([^\n]+)/i;
    const mobileNumberRegex = /mobile\s*number\s*:\s*([^\n]+)/i;
    const nameRegex = /name\s*:\s*([^\n]+)/i;
    const skillsRegex = /skills\s*:\s*([^\n]+)/i;
    const experienceRegex = /total\s*experience\s*:\s*([\d.]+)/i;

    // Function to safely trim and split matched text
    function extractMatches(regex: RegExp, text: string, split: boolean = false): string[] | string | null {
        const match = text.match(regex);
        if (match && match[1]) {
            return split ? match[1].split(',').map(item => item.trim()) : match[1].trim();
        }
        return split ? [] : null;
    }

    // Extract matches with null checks and default values
    const college_name = extractMatches(collegeNameRegex, text, false);
    const company_names = extractMatches(companyNamesRegex, text, false);
    const degree = extractMatches(degreeRegex, text, false);
    const designation = extractMatches(designationRegex, text, true);
    const email = extractMatches(emailRegex, text, false) as string;
    const mobile_number = extractMatches(mobileNumberRegex, text, false) as string;
    const name = extractMatches(nameRegex, text, false) as string;
    const skills = extractMatches(skillsRegex, text, true);
    const total_experience = extractMatches(experienceRegex, text, false) ? parseFloat(extractMatches(experienceRegex, text, false) as string) : 0;

    console.log('College Name:', college_name);
    console.log('Company Names:', company_names);
    console.log('Degree:', degree);
    console.log('Designation:', designation);
    console.log('Email:', email);
    console.log('Mobile Number:', mobile_number);
    console.log('Name:', name);
    console.log('Skills:', skills);
    console.log('Total Experience:', total_experience);

    // Construct the ResumeData object
    return {
        college_name: college_name ? [college_name] : [],
        company_names: company_names ? [company_names] : null,
        degree: degree ? [degree] : [],
        designation: Array.isArray(designation) ? designation : [designation],
        email,
        mobile_number,
        name,
        no_of_pages: 1,  // Update with the actual page count if known
        skills: Array.isArray(skills) ? skills : [skills],
        total_experience
    };
}
