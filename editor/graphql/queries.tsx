import { gql } from "@apollo/client";

export const GET_COLORS = gql`
	query color {
		color {
			red
		}
	}
`;
export const GET_DANCERS = gql`
	query Dancer {
		dancer {
			name
			id
		}
	}
`;
